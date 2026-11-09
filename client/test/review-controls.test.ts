import "./helpers/dom";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createElement, useState } from "react";
import { cleanup, render, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Environment, initialized } from "./helpers/form-fixtures";
import ReviewerTags from "../src/components/reviews/reviewer-tags";
import SearchComponent from "../src/components/search";
import MultipleFileUploadField from "../src/components/multiple-file-upload-field";
import { validateAnswerFields } from "../src/components/answer-fields";
import {
  FieldType,
  type FormFragment,
} from "../src/lib/graphql/generated/graphql";
afterEach(cleanup);

test("reviewer multi-select adds existing and custom values and removes chips", async () => {
  await initialized;
  const user = userEvent.setup();
  let selected: string[] = [];
  function Fixture() {
    const [values, setValues] = useState<string[]>(["sk"]);
    return createElement(ReviewerTags, {
      lng: "en",
      name: "languages",
      label: "Languages",
      value: values,
      suggestions: ["sk", "en"],
      onChange: (next) => {
        selected = next;
        setValues(next);
      },
    });
  }
  const view = render(createElement(Environment, null, createElement(Fixture)));
  const input = view.getByRole("combobox", { name: "Languages" });
  await user.click(input);
  await user.click(await view.findByRole("option", { name: "en" }));
  assert.deepEqual(selected, ["sk", "en"]);
  await user.type(input, "Italian");
  await user.click(await view.findByRole("option", { name: "Add: Italian" }));
  assert.deepEqual(selected, ["sk", "en", "Italian"]);
  await user.keyboard("{Escape}");
  await user.click(view.getByRole("button", { name: "Remove: sk" }));
  assert.deepEqual(selected, ["en", "Italian"]);
});

test("shared header search loads suggestions and opens the selected record", async () => {
  await initialized;
  const user = userEvent.setup();
  let selected = "";
  const view = render(
    createElement(
      Environment,
      null,
      createElement(
        SearchComponent<{ id: string; name: string }, { text: string }>,
        {
          placeholder: "Find reviewers",
          fetchOptions: async ({ text }) => [
            { id: "reviewer-a", name: `Result: ${text}` },
          ],
          Option: ({ data }) => createElement("span", null, data.name),
          onOptionSelect: (option) => {
            selected = option.id;
          },
        },
      ),
    ),
  );
  await user.click(view.getByRole("button", { name: "Find reviewers" }));
  await user.type(
    view.getByRole("combobox", { name: "Find reviewers" }),
    "Ada",
  );
  await user.click(await view.findByRole("option", { name: "Result: Ada" }));
  await waitFor(() => assert.equal(view.queryByRole("dialog"), null));
  assert.equal(selected, "reviewer-a");
  await user.click(view.getByRole("button", { name: "Find reviewers" }));
  await user.type(
    view.getByRole("combobox", { name: "Find reviewers" }),
    "Ada",
  );
  assert.equal(
    (view.getByRole("combobox", { name: "Find reviewers" }) as HTMLInputElement)
      .value,
    "Ada",
  );
  await view.findByRole("option", { name: "Result: Ada" });
  await user.keyboard("{Escape}");
  await waitFor(() => assert.equal(view.queryByRole("dialog"), null));
});

test("shared uploader counts stored files and rejects oversized selections", async () => {
  let error = "";
  let changes = 0;
  const view = render(
    createElement(MultipleFileUploadField, {
      existingCount: 1,
      maxFiles: 2,
      maxSize: 100,
      value: [],
      onChange: () => changes++,
      onError: (message) => {
        error = message;
      },
    }),
  );
  const input = view.container.querySelector("input")!;
  const file = (name: string, size = 2) =>
    new File(["x".repeat(size)], name, { type: "application/pdf" });
  fireEvent.change(input, {
    target: { files: [file("a.pdf"), file("b.pdf")] },
  });
  await waitFor(() => assert.match(error, /Maximum 2 files/));
  assert.equal(changes, 0);
  error = "";
  fireEvent.change(input, { target: { files: [file("large.pdf", 200)] } });
  await waitFor(() => assert.match(error, /per file/));
  assert.equal(changes, 0);
  fireEvent.change(input, { target: { files: [file("valid.pdf")] } });
  await waitFor(() => assert.equal(changes, 1));
});

test("review file counts enforce bounds and allow optional empty attachments", () => {
  const field: FormFragment["fields"][number] = {
    id: "files",
    label: "Files",
    type: FieldType.FileUpload,
    required: false,
    minFiles: 2,
    maxFiles: 3,
    helpText: null,
    placeholder: null,
    selectOptions: null,
  };
  assert.deepEqual(validateAnswerFields([field], { files: [] }, "en"), {});
  assert.ok(validateAnswerFields([field], { files: ["a"] }, "en").files);
  assert.deepEqual(
    validateAnswerFields([field], { files: ["a", "b"] }, "en"),
    {},
  );
  assert.ok(
    validateAnswerFields([field], { files: ["a", "b", "c", "d"] }, "en").files,
  );
});
