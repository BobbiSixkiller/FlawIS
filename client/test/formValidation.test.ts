import { createInstance } from "i18next";
import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import { compareFields } from "../src/lib/validation/form-validation";
import {
  Access,
  FieldType,
  StudyProgramme,
  type FormFragment,
} from "../src/lib/graphql/generated/graphql";
import en from "../src/lib/i18n/locales/en/validation.json";
import sk from "../src/lib/i18n/locales/sk/validation.json";
import { createRegistrationSchema } from "../src/lib/validation/registration-form-schema";
import { createUserFormSchema } from "../src/lib/validation/user-form-schema";

async function translation(lng: "sk" | "en") {
  const i18n = createInstance();
  await i18n.init({
    lng,
    resources: { sk: { validation: sk }, en: { validation: en } },
    defaultNS: "validation",
  });
  return i18n.getFixedT(lng, "validation");
}
const options = {
  profile: false,
  registering: true,
  student: false,
  requirePhone: false,
  requireCv: false,
  requireUniversityEmail: false,
};
const valid = {
  name: "  Dominika   Veselá  ",
  email: "dominika@example.com",
  password: "Password123",
  confirmPass: "Password123",
  organization: "  Právnická   fakulta  ",
  address: {},
  access: [Access.Student],
  telephone: "",
  studyProgramme: null,
  privacy: true,
  files: [],
  avatar: null,
};

test("account schemas preserve normalization, matching passwords, titles, and institution rules", async () => {
  const schema = createUserFormSchema(await translation("sk"), options);
  const parsed = schema.parse(valid);
  assert.equal(parsed.name, "Dominika Veselá");
  assert.equal(parsed.organization, "Právnická fakulta");
  for (const name of ["JUDr. Dominika Veselá", "Dominika", "Dominika 123"])
    assert.equal(schema.safeParse({ ...valid, name }).success, false);
  const mismatch = schema.safeParse({
    ...valid,
    confirmPass: "Different123",
    organization: "",
  });
  assert.equal(mismatch.success, false);
  if (!mismatch.success)
    assert.ok(
      mismatch.error.issues.some(
        (issue) => issue.path.join(".") === "confirmPass",
      ),
    );
  assert.equal(schema.safeParse({ ...valid, privacy: false }).success, false);
});

test("profile passwords are optional while student contact and file requirements remain conditional", async () => {
  const t = await translation("en");
  const profile = createUserFormSchema(t, {
    ...options,
    profile: true,
    registering: false,
  });
  const parsed = profile.parse({ ...valid, password: "  ", confirmPass: "" });
  assert.equal(parsed.password, null);
  assert.equal(parsed.confirmPass, null);
  const student = createUserFormSchema(t, {
    ...options,
    student: true,
    requireCv: true,
    requirePhone: true,
    requireUniversityEmail: true,
  });
  const values = {
    ...valid,
    email: "dominika@flaw.uniba.sk",
    address: {
      street: " Street ",
      city: " Bratislava ",
      country: " SK ",
      postal: " 81101 ",
    },
    studyProgramme: Object.values(StudyProgramme)[0],
    telephone: "+421911222333",
    files: [new File(["cv"], "cv.pdf")],
  };
  assert.equal(student.safeParse(values).success, true);
  for (const overrides of [
    { email: "dominika@example.com" },
    { files: [] },
    { telephone: "invalid" },
    { studyProgramme: null },
    { address: { ...values.address, street: "" } },
  ])
    assert.equal(student.safeParse({ ...values, ...overrides }).success, false);
});

test("validation messages stay scoped to each language", async () => {
  const slovak = createUserFormSchema(await translation("sk"), options);
  const english = createUserFormSchema(await translation("en"), options);
  const skResult = slovak.safeParse({ ...valid, email: "wrong" });
  const enResult = english.safeParse({ ...valid, email: "wrong" });
  assert.equal(skResult.success, false);
  assert.equal(enResult.success, false);
  if (!skResult.success && !enResult.success) {
    assert.equal(skResult.error.issues[0].message, sk.email);
    assert.equal(enResult.error.issues[0].message, en.email);
  }
});

test("dynamic fields keep text normalization, file limits, and permissive attendee editing", async () => {
  const fields: FormFragment["fields"] = [
    { id: "text", type: FieldType.Text, label: "Name", required: true },
    {
      id: "file",
      type: FieldType.FileUpload,
      label: "File",
      required: true,
      minFiles: 1,
      maxFiles: 1,
    },
  ];
  const t = await translation("sk");
  const schema = createRegistrationSchema(fields, t);
  const file = new File(["proof"], "proof.pdf");
  assert.deepEqual(
    schema.parse({ field_text: "  Answer  ", field_file: [file] }),
    { field_text: "Answer", field_file: [file] },
  );
  for (const files of [[], [file, file]]) {
    const result = schema.safeParse({
      field_text: "Answer",
      field_file: files,
    });
    assert.equal(result.success, false);
    if (!result.success)
      assert.equal(result.error.issues[0].path[0], "field_file");
  }
  const edit = createRegistrationSchema(fields, t, false);
  assert.deepEqual(edit.parse({ field_text: "", field_file: [] }), {
    field_text: "",
    field_file: [],
  });
});

test("cross-field date errors run despite unfinished fields in future wizard steps", () => {
  const dates = compareFields(
    z.object({ start: z.date(), end: z.date(), name: z.string() }),
    "end",
    "start",
    (end, start) => end >= start,
    "End before start",
  );
  const schema = z.intersection(
    dates,
    z.object({ billing: z.object({ name: z.string().min(1) }) }),
  );
  const result = schema.safeParse({
    start: new Date(2026, 8, 9),
    end: new Date(2026, 8, 8),
  });
  assert.equal(result.success, false);
  if (!result.success)
    assert.ok(
      result.error.issues.some(
        (issue) =>
          issue.path.join(".") === "end" &&
          issue.message === "End before start",
      ),
    );
});
