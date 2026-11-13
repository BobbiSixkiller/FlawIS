import "reflect-metadata";
import assert from "node:assert/strict";
import test from "node:test";
import { ObjectId } from "mongodb";
import { FieldType } from "../src/entitites/Form";
import { reviewFormView } from "../src/services/reviews/form-view";
import { validateAnswers } from "../src/util/formValidation";
import { createContext, issueSessionToken, signJwt } from "../src/util/auth";
import { seal, unseal } from "../src/util/secrets";
import { UserService } from "../src/services/user.service";
import { ActivityService } from "../src/services/reviews/activity.service";
import { requestContext } from "../src/util/requestContext";
import { resetScope, courseFileUrls } from "../scripts/reset-courses";
import {
  defaultReportTemplate,
  renderReport,
} from "../src/services/reviews/export.service";
import PizZip from "pizzip";

test("JSON review questionnaires use the same enum names as typed GraphQL forms", () => {
  const fields = Object.values(FieldType).map((type) => ({
    id: new ObjectId(),
    type,
    label: type,
  }));
  const form = { id: new ObjectId(), version: 3, fields };
  const view = reviewFormView(form);
  assert.deepEqual(
    view.fields.map((f) => f.type),
    Object.keys(FieldType),
  );
  assert.deepEqual(
    view.fields.map((f) => f.id),
    fields.map((f) => f.id),
  );
  assert.equal(view.version, 3);
  assert.equal(form.fields[3].type, FieldType.RadioGroup);
});

test("drafts permit incomplete answers; final reports reject missing and forged fields", () => {
  const id = new ObjectId();
  const fields = [
    {
      id,
      type: FieldType.RadioGroup,
      label: "Recommendation",
      required: true,
      selectOptions: [{ value: "PUBLISH", text: "Publish" }],
    },
  ];
  assert.deepEqual(validateAnswers(fields, {}, false), {});
  assert.throws(() => validateAnswers(fields, {}, true), /Required/);
  assert.throws(
    () => validateAnswers(fields, { [String(id)]: "FORGED" }, true),
    /Invalid choice/,
  );
  assert.throws(
    () => validateAnswers(fields, { other: "text" }, false),
    /Unknown field/,
  );
});
test("session tokens retain the original actor and reject sessions minted by the old generic token field", () => {
  const actor = {
    id: new ObjectId(),
    email: "admin@example.test",
    name: "Admin",
    access: [],
  };
  const request = (token: string) =>
    createContext({
      req: { cookies: { accessToken: token }, headers: {} },
      res: {},
    } as any);
  const original = String(new ObjectId());
  assert.equal(
    request(issueSessionToken(actor, original)).user!.originalActorId,
    original,
  );
  assert.equal(request("Bearer " + signJwt(actor)).user, null);
});
test("notification encryption authenticates ciphertext and never stores the token in plain text", () => {
  process.env.NOTIFICATION_SECRET = "isolated-safety-test-secret";
  const payload = JSON.stringify({ token: "private-link-token" });
  const encoded = seal(payload);
  assert.ok(!encoded.includes("private-link-token"));
  assert.equal(unseal(encoded), payload);
  const changed = encoded.slice(0, -2) + (encoded.endsWith("00") ? "11" : "00");
  assert.throws(() => unseal(changed));
});
test("read auditing tolerates failures, while mutation auditing propagates them", async () => {
  const service = new ActivityService();
  const writes: any[] = [];
  (service as any).events.create = async (value: unknown) => {
    writes.push(value);
    throw new Error("Audit unavailable");
  };
  const originalError = console.error;
  console.error = () => {};
  try {
    const user = {
      id: new ObjectId(),
      name: "Admin",
      email: "test@example.test",
      access: [],
      originalActorId: String(new ObjectId()),
    };
    await requestContext.run(
      { requestId: "correlation", events: new Set() },
      async () => {
        await service.read(user, "submission.viewed");
        await service.read(user, "submission.viewed");
        assert.equal(writes.length, 1);
        assert.equal(writes[0].originalActor, user.originalActorId);
        assert.equal(writes[0].requestId, "correlation");
      },
    );
    await assert.rejects(
      service.record(user, "submission.changed"),
      /Audit unavailable/,
    );
  } finally {
    console.error = originalError;
  }
});
test("course reset scopes preserve conference invoices, shared forms and invoice counters", () => {
  const course = new ObjectId(),
    attendee = new ObjectId(),
    session = new ObjectId();
  const filters = resetScope([course], [attendee], [session]);
  assert.equal(filters.invoices.ownerType, "COURSE_ATTENDEE");
  assert.deepEqual(filters.forms, { course: { $exists: true } });
  assert.equal(filters.formanswers.context, "COURSE");
  assert.ok(
    !Object.keys(filters).some((name) =>
      [
        "users",
        "conferences",
        "submissions",
        "invoicecounters",
        "formdefinitions",
      ].includes(name),
    ),
  );
  assert.deepEqual(
    [
      ...courseFileUrls({
        answer: ["http://minio:9000/courses/a.pdf"],
        shared: "http://minio:9000/conferences/a.pdf",
      }),
    ],
    ["http://minio:9000/courses/a.pdf"],
  );
});
test("DOCX rendering escapes XML and preserves multiline reports", () => {
  const zip = new PizZip(
    renderReport(defaultReportTemplate(), {
      paper: "A < B & C",
      reviewer: "Reviewer",
      answers: "First line\nSecond line",
    }),
  );
  const xml = zip.file("word/document.xml")!.asText();
  assert.match(xml, /A &lt; B &amp; C/);
  assert.match(xml, /Second line/);
  assert.match(xml, /w:br/);
});

test("legacy session tokens cannot be exchanged for reset or activation sessions", async () => {
  const service = new UserService(
    {} as any,
    {} as any,
    {} as any,
    { translate: (key: string) => key } as any,
  );
  const legacy = signJwt({ id: String(new ObjectId()), access: ["ADMIN"] });
  await assert.rejects(
    service.resetPassword(legacy, "unused-password"),
    /invalidToken/,
  );
  await assert.rejects(service.activateUser(legacy), /invalidActivationToken/);
  const activation = signJwt({
    id: String(new ObjectId()),
    purpose: "activation",
  });
  await assert.rejects(
    service.resetPassword(activation, "unused-password"),
    /invalidToken/,
  );
  const reset = signJwt({
    id: String(new ObjectId()),
    purpose: "password-reset",
  });
  await assert.rejects(service.activateUser(reset), /invalidActivationToken/);
});

test("attachment bounds allow incomplete drafts and optional empty answers", () => {
  const id = new ObjectId();
  const fields = [
    {
      id,
      label: "Files",
      type: FieldType.FileUpload,
      required: false,
      minFiles: 2,
      maxFiles: 3,
    },
  ];
  const key = String(id);
  assert.deepEqual(validateAnswers(fields, { [key]: [] }, true), {});
  assert.deepEqual(validateAnswers(fields, { [key]: ["a"] }, false), {
    [key]: ["a"],
  });
  assert.throws(
    () => validateAnswers(fields, { [key]: ["a"] }, true),
    /Invalid files/,
  );
  assert.throws(
    () => validateAnswers(fields, { [key]: ["a", "b", "c", "d"] }, false),
    /Invalid files/,
  );
});

test("form publishing rejects impossible attachment limits before writing a version", async () => {
  const { FormService } = await import("../src/services/form.service");
  const service = new FormService(
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
  );
  for (const limits of [
    { minFiles: 0, maxFiles: 0 },
    { minFiles: 3, maxFiles: 2 },
    { minFiles: 11 },
  ]) {
    await assert.rejects(
      service.publish(new ObjectId(), [
        {
          id: new ObjectId(),
          label: "Files",
          type: FieldType.FileUpload,
          required: false,
          ...limits,
        },
      ]),
      /Maximum files/,
    );
  }
});
