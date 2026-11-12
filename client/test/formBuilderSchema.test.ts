import assert from "node:assert/strict";
import test from "node:test";
import { FieldType } from "../src/lib/graphql/generated/graphql";
import { newFormField, editableFormFields } from "../src/lib/forms/builder";
import { createFormFieldsSchema } from "../src/lib/validation/form-builder-schema";

test("both builder hosts validate choices and upload bounds with their own empty-form policy", () => {
  assert.equal(createFormFieldsSchema("en").safeParse([]).success, true);
  assert.equal(createFormFieldsSchema("en", 1).safeParse([]).success, false);
  const file = { ...newFormField(FieldType.FileUpload), label: "Files" };
  assert.deepEqual(
    [file.minFiles, file.maxFiles, file.required],
    [0, 10, false],
  );
  const valid = createFormFieldsSchema("en");
  assert.equal(valid.safeParse([file]).success, true);
  for (const patch of [
    { required: true },
    { maxFiles: 21 },
    { minFiles: 1.5 },
    { minFiles: 3, maxFiles: 2 },
  ])
    assert.equal(valid.safeParse([{ ...file, ...patch }]).success, false);
  const choice = {
    ...newFormField(FieldType.Select),
    label: "Choice",
    selectOptions: [
      { value: "a", text: "First" },
      { value: "a", text: "Second" },
    ],
  };
  const result = valid.safeParse([choice]);
  assert.equal(result.success, false);
  if (!result.success)
    assert.deepEqual(result.error.issues[0].path, [
      0,
      "selectOptions",
      1,
      "value",
    ]);
  assert.equal(
    valid.safeParse([{ ...choice, selectOptions: [] }]).success,
    false,
  );
  assert.equal(
    valid.parse([
      { ...choice, selectOptions: [{ value: " legacy ", text: "Legacy" }] },
    ])[0].selectOptions?.[0].value,
    " legacy ",
  );
  assert.equal(valid.safeParse([file, file]).success, false);
  assert.match(
    createFormFieldsSchema("sk", 1).safeParse([]).error!.issues[0].message,
    /Pridajte/,
  );
});

test("editable versions retain stable IDs, choice values, rich help and configured file limits", () => {
  const field = {
    ...newFormField(FieldType.FileUpload),
    label: "Attachment",
    minFiles: 2,
    maxFiles: 5,
    helpText: "<p><strong>Help</strong></p>",
    placeholder: null,
    selectOptions: null,
  };
  const form = {
    id: "definition",
    definition: "form",
    version: 3,
    fields: [field],
    createdAt: "",
    updatedAt: "",
  };
  const before = JSON.stringify(form);
  const draft = editableFormFields(
    form as Parameters<typeof editableFormFields>[0],
  );
  assert.equal(draft[0].id, field.id);
  assert.deepEqual([draft[0].minFiles, draft[0].maxFiles], [2, 5]);
  draft[0].label = "Edited";
  assert.equal(JSON.stringify(form), before);
});
