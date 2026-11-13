import "./helpers/dom";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createElement, useState } from "react";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { parseReviewerCsv, reviewerCsv } from "../src/lib/reviews/csv";
import { stage, type QueueRow } from "../src/lib/reviews/types";
import { isSubdomainPublicPath } from "../src/lib/authRoutes";
import { AnswerFields } from "../src/components/form/answer-fields";
import {
  FieldType,
  type FormFragment,
} from "../src/lib/graphql/generated/graphql";
afterEach(cleanup);
test("one completed report out of two remains in review; corrections take precedence", () => {
  const row = {
    hasFile: true,
    requiredReviews: 2,
    review: { decision: "PENDING" },
    assignments: [{ status: "SUBMITTED" }],
  } as QueueRow;
  assert.equal(stage(row), "IN_REVIEW");
  assert.equal(stage({ ...row, requiredReviews: 1 }), "REVIEWS_COMPLETE");
  assert.equal(stage({ ...row, correctionStatus: "RECEIVED" }), "RECEIVED");
});
test("private reviewer and correction links are public only on the conference tenant", () => {
  const token = "A".repeat(43);
  assert.equal(
    isSubdomainPublicPath("conferences.example.test", `/review/${token}`),
    true,
  );
  assert.equal(
    isSubdomainPublicPath("conferences.example.test", `/revise/${token}`),
    true,
  );
  assert.equal(
    isSubdomainPublicPath("flawis.example.test", `/review/${token}`),
    false,
  );
  assert.equal(
    isSubdomainPublicPath("conferences.example.test", "/review/invalid-link"),
    true,
  );
  assert.equal(
    isSubdomainPublicPath("conferences.example.test", `/review/${token}/extra`),
    false,
  );
});
test("reviewer CSV handles quoted names, newlines and malformed files", () => {
  const row = {
    name: 'Reviewer, "A"',
    email: "reviewer@example.test",
    institution: "University",
    department: "Law",
    languages: ["sk", "en"],
    expertise: ["EU law"],
    notes: "First line\nSecond line",
  };
  const parsed = parseReviewerCsv("\uFEFF" + reviewerCsv([row]));
  assert.equal(parsed[0].name, row.name);
  assert.equal(parsed[0].notes, row.notes);
  assert.equal(parsed[0].languages, "sk;en");
  assert.throws(
    () => parseReviewerCsv('name,email\n"unterminated'),
    /unclosed/,
  );
  assert.throws(() => parseReviewerCsv("name,telephone\nA,123"), /email/);
});
test("shared answer controls expose labelled choices, retain drafts and report failed uploads", async () => {
  const fields = [
    {
      id: "recommendation",
      type: FieldType.RadioGroup,
      label: "Recommendation",
      required: true,
      selectOptions: [
        { value: "PUBLISH", text: "Publish" },
        { value: "REJECT", text: "Reject" },
      ],
    },
    {
      id: "comments",
      type: FieldType.Textarea,
      label: "Comments",
      required: false,
    },
    {
      id: "file",
      type: FieldType.FileUpload,
      label: "Attachment",
      required: false,
      maxFiles: 1,
    },
  ].map((f) => ({
    placeholder: null,
    helpText: null,
    minFiles: null,
    maxFiles: null,
    selectOptions: null,
    ...f,
  })) satisfies FormFragment["fields"];
  function Fixture() {
    const [values, setValues] = useState<Record<string, string | string[]>>({
      comments: "Saved draft",
    });
    return createElement(AnswerFields, {
      fields,
      values,
      onChange: (id, value) =>
        setValues((current) => ({ ...current, [id]: value })),
      upload: async () => {
        throw new Error("Upload unavailable");
      },
    });
  }
  const view = render(createElement(Fixture));
  assert.equal(
    (view.getByRole("textbox", { name: "Comments" }) as HTMLTextAreaElement)
      .value,
    "Saved draft",
  );
  const choice = view.getByRole("radio", { name: "Publish" });
  fireEvent.click(choice);
  await waitFor(() =>
    assert.equal(choice.getAttribute("aria-checked"), "true"),
  );
  fireEvent.change(view.getByLabelText("Attachment", { selector: "input" }), {
    target: { files: [new File(["content"], "review.docx")] },
  });
  await waitFor(() => assert.ok(view.getByText("Upload unavailable")));
  assert.equal(
    (view.getByRole("textbox", { name: "Comments" }) as HTMLTextAreaElement)
      .value,
    "Saved draft",
  );
});
