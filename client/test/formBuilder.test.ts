import "./helpers/dom";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Environment, initialized } from "./helpers/form-fixtures";
import {
  BuilderFixture,
  BuilderWizardFixture,
} from "./helpers/form-builder-fixtures";
import FormEditor from "../src/app/[lng]/flawis/forms/_components/form-editor";
import { newFormField } from "../src/lib/forms/builder";
import {
  FieldType,
  type FormFieldInput,
} from "../src/lib/graphql/generated/graphql";

afterEach(cleanup);

test("typed add buttons create all field types at the bottom and focus the new label", async () => {
  await initialized;
  const view = render(createElement(BuilderFixture), { wrapper: Environment });
  const user = userEvent.setup();
  const labels = [
    "Short text",
    "Long text",
    "Dropdown",
    "Single choice",
    "File upload",
  ];
  const types = [
    FieldType.Text,
    FieldType.Textarea,
    FieldType.Select,
    FieldType.RadioGroup,
    FieldType.FileUpload,
  ];
  for (const [i, label] of labels.entries()) {
    await user.click(view.getByRole("button", { name: label }));
    const inputs = view.getAllByRole("textbox", { name: "Label" });
    assert.ok(document.activeElement === inputs[i]);
    await user.type(inputs[i], `Field ${i}`);
    const draft = JSON.parse(
      view.getByTestId("draft").textContent!,
    ) as FormFieldInput[];
    assert.equal(draft[i].type, types[i]);
    assert.match(draft[i].id!, /^[a-f0-9]{24}$/);
  }
  const lastCard = view
    .getAllByText(/Field 5 ·/)[0]
    .closest('[data-slot="card"]')!;
  assert.ok(
    lastCard.compareDocumentPosition(
      view.getByRole("button", { name: "Short text" }),
    ) & Node.DOCUMENT_POSITION_FOLLOWING,
  );
  assert.equal(
    view.queryByRole("button", { name: "Add overall recommendation" }),
    null,
  );
  assert.equal(
    (
      view.getByRole("spinbutton", {
        name: "Minimum files",
      }) as HTMLInputElement
    ).value,
    "0",
  );
  assert.equal(
    (
      view.getByRole("spinbutton", {
        name: "Maximum files",
      }) as HTMLInputElement
    ).value,
    "10",
  );
  await user.click(view.getAllByRole("checkbox", { name: "Required" })[4]);
  assert.equal(
    (
      view.getByRole("spinbutton", {
        name: "Minimum files",
      }) as HTMLInputElement
    ).value,
    "1",
  );
});

test("choice edits and reordering retain field IDs, option values and keyboard focus", async () => {
  await initialized;
  const choice = {
    ...newFormField(FieldType.Select),
    label: "Choice",
    selectOptions: [
      { value: "FIRST", text: "First" },
      { value: "SECOND", text: "Second" },
    ],
  };
  const text = { ...newFormField(FieldType.Text), label: "Text" };
  const source = JSON.stringify([choice, text]);
  const view = render(
    createElement(BuilderFixture, { initial: [choice, text] }),
    { wrapper: Environment },
  );
  const user = userEvent.setup();
  const value = view.getByRole("textbox", { name: "Value 1" });
  await user.type(value, "_EDITED");
  assert.ok(document.activeElement === value);
  await user.click(view.getByRole("button", { name: "Move down: Options 1" }));
  await user.click(view.getByRole("button", { name: "Move down: Field 1" }));
  const draft = JSON.parse(
    view.getByTestId("draft").textContent!,
  ) as FormFieldInput[];
  assert.deepEqual(
    draft.map((f) => f.id),
    [text.id, choice.id],
  );
  assert.deepEqual(
    draft[1].selectOptions?.map((o) => o.value),
    ["SECOND", "FIRST_EDITED"],
  );
  await user.type(
    view.getByRole("textbox", { name: "Display text 1" }),
    " revised",
  );
  assert.equal(
    JSON.parse(view.getByTestId("draft").textContent!)[1].selectOptions[0].text,
    "Second revised",
  );
  assert.equal(JSON.stringify([choice, text]), source);
  await user.click(view.getByRole("button", { name: "Remove option 1" }));
  await user.click(view.getByRole("button", { name: "Remove option 1" }));
  await user.click(view.getByRole("button", { name: "Save" }));
  await waitFor(() =>
    assert.ok(
      document.activeElement ===
        view.getByRole("button", { name: "Add option" }),
    ),
  );
});

test("preview parses rich help, preserves formatting and returns to an invalid field on submit", async () => {
  await initialized;
  const initial = [
    {
      ...newFormField(FieldType.Text),
      helpText:
        '<p><strong>Read this</strong> <a href="https://example.com">Link</a><img src=x onerror=alert(1)></p><script>alert(1)</script>',
    },
  ];
  const view = render(createElement(BuilderFixture, { initial }), {
    wrapper: Environment,
  });
  const user = userEvent.setup();
  await user.click(view.getByRole("tab", { name: "Preview" }));
  const strong = await view.findByText("Read this", { selector: "strong" });
  assert.equal(strong.tagName, "STRONG");
  assert.equal(
    view.getByRole("link", { name: "Link" }).getAttribute("href"),
    "https://example.com",
  );
  assert.equal(view.container.querySelector("script, img, [onerror]"), null);
  await user.click(view.getByRole("button", { name: "Save" }));
  await waitFor(() =>
    assert.ok(
      document.activeElement === view.getByRole("textbox", { name: "Label" }),
    ),
  );
  assert.ok(view.getByText("Enter a field label (up to 200 characters)."));
});

test("library preset is last; failed publishing retains a dirty draft and retries the same definition", async () => {
  await initialized;
  let created = 0,
    published = 0,
    closed = 0;
  const payloads: { definition: string; fields: FormFieldInput[] }[] = [];
  const view = render(
    createElement(FormEditor, {
      editor: {},
      lng: "en",
      onClose: () => closed++,
      onSaved: () => {},
      createDefinition: async () => {
        created++;
        return { id: "definition" };
      },
      publishVersion: async (data) => {
        payloads.push(data);
        if (++published === 1) throw new Error("Try again");
      },
    }),
    { wrapper: Environment },
  );
  const user = userEvent.setup();
  await user.type(view.getByRole("textbox", { name: "Name" }), "Reusable form");
  const preset = view.getByRole("button", {
    name: "Add overall recommendation",
  });
  await user.click(view.getByRole("button", { name: "Publish new version" }));
  await waitFor(() =>
    assert.ok(
      document.activeElement ===
        view.getByRole("button", { name: "Short text" }),
    ),
  );
  assert.equal(preset.parentElement?.lastElementChild, preset);
  await user.click(preset);
  assert.equal(
    (
      view.getByRole("textbox", {
        name: "Label",
      }) as HTMLInputElement
    ).value,
    "Overall recommendation",
  );
  await user.click(view.getByRole("button", { name: "Publish new version" }));
  assert.ok(await view.findByText("Try again"));
  assert.equal(created, 1);
  assert.equal(closed, 0);
  assert.deepEqual(
    payloads[0].fields[0].selectOptions?.map((c) => c.value),
    ["PUBLISH", "CONDITIONAL", "REJECT"],
  );
  assert.equal(payloads[0].fields[0].required, true);
  await user.click(view.getByRole("button", { name: "Cancel" }));
  assert.ok(view.getByRole("alertdialog"));
  await user.click(
    within(view.getByRole("alertdialog")).getByRole("button", {
      name: /Keep editing/,
    }),
  );
  await user.click(view.getByRole("button", { name: "Publish new version" }));
  await waitFor(() => assert.equal(closed, 1));
  assert.equal(created, 1);
  assert.equal(payloads[1].fields[0].id, payloads[0].fields[0].id);
});

test("course wizard retains its field draft across steps and validates before saving", async () => {
  await initialized;
  let saved: FormFieldInput[] | undefined;
  const view = render(
    createElement(BuilderWizardFixture, {
      save: (data) => {
        saved = data.formFields;
      },
    }),
    { wrapper: Environment },
  );
  const user = userEvent.setup();
  await user.click(view.getByRole("button", { name: /Next/ }));
  await user.click(view.getByRole("button", { name: "File upload" }));
  await user.type(view.getByRole("textbox", { name: "Label" }), "Certificate");
  fireEvent.change(view.getByRole("spinbutton", { name: "Maximum files" }), {
    target: { value: "21" },
  });
  await user.click(view.getByRole("button", { name: /Submit|Save/ }));
  assert.equal(saved, undefined);
  assert.ok(
    await view.findByText(
      "Enter a whole maximum from 1 to 20, at least the minimum.",
    ),
  );
  fireEvent.change(view.getByRole("spinbutton", { name: "Maximum files" }), {
    target: { value: "5" },
  });
  await user.click(view.getByRole("button", { name: /Back/ }));
  await user.click(view.getByRole("button", { name: /Next/ }));
  assert.equal(
    (
      view.getByRole("textbox", {
        name: "Label",
      }) as HTMLInputElement
    ).value,
    "Certificate",
  );
  await user.click(view.getByRole("button", { name: /Submit|Save/ }));
  await waitFor(() => assert.equal(saved?.[0].maxFiles, 5));
  await waitFor(() => assert.equal(saved?.[0].minFiles, 0));
});

test("Slovak builder controls and validation use generic localized wording", async () => {
  await initialized;
  const view = render(createElement(BuilderFixture, { lng: "sk" }), {
    wrapper: Environment,
  });
  const user = userEvent.setup();
  await user.click(view.getByRole("button", { name: "Krátky text" }));
  assert.ok(view.getByRole("textbox", { name: "Názov poľa" }));
  await user.click(view.getByRole("button", { name: "Save" }));
  assert.ok(await view.findByText("Zadajte názov poľa (najviac 200 znakov)."));
});

test("editing an existing library version preserves its source and serializes rich help", async () => {
  await initialized;
  const choice = {
    ...newFormField(FieldType.RadioGroup),
    label: "Decision",
    selectOptions: [
      { value: " legacy ", text: "Legacy" },
      { value: "SECOND", text: "Second" },
    ],
  };
  const version = {
    id: "version",
    definition: "definition",
    version: 2,
    fields: [choice],
    createdAt: "",
    updatedAt: "",
  } as NonNullable<Parameters<typeof FormEditor>[0]["editor"]["version"]>;
  const before = JSON.stringify(version);
  let saved: FormFieldInput[] | undefined;
  const view = render(
    createElement(FormEditor, {
      editor: {
        definition: { id: "definition", name: "Existing", description: "" },
        version,
      },
      lng: "en",
      onClose: () => {},
      onSaved: () => {},
      createDefinition: async () => {
        throw new Error("Must reuse definition");
      },
      publishVersion: async (data) => {
        saved = data.fields;
      },
    }),
    { wrapper: Environment },
  );
  const user = userEvent.setup();
  await user.type(view.getByRole("textbox", { name: "Label" }), " updated");
  const help = await view.findByRole("textbox", {
    name: "Help text",
  });
  await user.click(help);
  await user.paste("Formatted guidance");
  await user.click(view.getByRole("button", { name: "Remove option 2" }));
  await user.click(view.getByRole("button", { name: "Short text" }));
  await user.click(view.getByRole("button", { name: "Remove field 2" }));
  await user.click(view.getByRole("button", { name: "Publish new version" }));
  await waitFor(() => assert.equal(saved?.[0].label, "Decision updated"));
  assert.equal(saved?.[0].id, choice.id);
  assert.equal(saved?.[0].selectOptions?.[0].value, " legacy ");
  assert.match(saved?.[0].helpText ?? "", /<p[^>]*>Formatted guidance<\/p>/);
  assert.equal(saved?.length, 1);
  assert.equal(JSON.stringify(version), before);
});
