// Initialize the DOM before React performs browser capability detection.
import "./helpers/dom";
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react";
import type { Editor as TiptapEditor } from "@tiptap/core";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createElement } from "react";
import {
  ComboboxFixture,
  ControlsForm,
  defaults,
  Environment,
  FileFixture,
  initialized,
  TicketFixture,
  WizardFixture,
} from "./helpers/form-fixtures";

afterEach(cleanup);
const wrapper = Environment;

test("fields forward defaults, refs, descriptions, validation, blur, and root errors", async () => {
  await initialized;
  const view = render(createElement(ControlsForm, { onSubmit: () => {} }), {
    wrapper,
  });
  const email = view.getByRole("textbox", {
    name: "Email",
  }) as HTMLInputElement;
  assert.equal(email.value, "initial@example.com");
  assert.equal(
    document.getElementById(email.getAttribute("aria-describedby")!)
      ?.textContent,
    "Work email",
  );
  fireEvent.change(email, { target: { value: "invalid" } });
  fireEvent.blur(email);
  await waitFor(() =>
    assert.equal(view.getByTestId("touched").textContent, "true"),
  );
  fireEvent.click(view.getByRole("button", { name: "Save" }));
  await waitFor(() =>
    assert.equal(
      view.getByText("Invalid email").id,
      email.getAttribute("aria-describedby"),
    ),
  );
  assert.equal(email.getAttribute("aria-invalid"), "true");
  assert.equal(document.activeElement, email);
  fireEvent.click(view.getByRole("button", { name: "Server error" }));
  await waitFor(() =>
    assert.equal(view.getByRole("alert").textContent, "Server unavailable"),
  );
});

test("reset and reactive values update selects and phone fields; blank numbers stay null", async () => {
  const saved: unknown[] = [];
  const view = render(
    createElement(ControlsForm, { onSubmit: (value) => saved.push(value) }),
    { wrapper },
  );
  fireEvent.click(view.getByRole("button", { name: "Reset" }));
  await waitFor(() =>
    assert.match(
      view.getByRole("button", { name: "Choice" }).textContent!,
      /Beta/,
    ),
  );
  assert.equal(
    (view.getByRole("textbox", { name: "Phone" }) as HTMLInputElement).value,
    "777123456",
  );
  fireEvent.change(view.getByRole("spinbutton", { name: "Count" }), {
    target: { value: "" },
  });
  fireEvent.change(view.getByLabelText("Date"), {
    target: { value: "2026-09-08T16:45" },
  });
  fireEvent.change(view.getByLabelText("Invoice date"), {
    target: { value: "2026-09-12" },
  });
  fireEvent.click(view.getByRole("checkbox", { name: "Enabled" }));
  fireEvent.click(view.getByRole("button", { name: "Save" }));
  await waitFor(() => assert.equal(saved.length, 1));
  const result = saved[0] as typeof defaults;
  assert.equal(result.count, null);
  assert.equal(result.date?.getHours(), 16);
  assert.equal(result.date?.getMinutes(), 45);
  assert.equal(result.invoiceDate?.toISOString(), "2026-09-12T00:00:00.000Z");
  assert.equal(result.enabled, true);
  view.rerender(
    createElement(ControlsForm, {
      onSubmit: () => {},
      values: { ...defaults, choice: "a", phone: "+421911222333" },
    }),
  );
  await waitFor(() =>
    assert.match(
      view.getByRole("button", { name: "Choice" }).textContent!,
      /Alpha/,
    ),
  );
  assert.equal(
    (view.getByRole("textbox", { name: "Phone" }) as HTMLInputElement).value,
    "911222333",
  );
});

test("wizard validates only the active step and retains all values through conditional navigation", async () => {
  const saved: unknown[] = [];
  const view = render(
    createElement(WizardFixture, { onSubmit: (value) => saved.push(value) }),
    { wrapper },
  );
  const file = new File(["application"], "application.pdf", {
    type: "application/pdf",
  });
  fireEvent.change(view.container.querySelector('input[type="file"]')!, {
    target: { files: [file] },
  });
  await waitFor(() =>
    assert.ok(view.getByRole("link", { name: "application.pdf" })),
  );
  fireEvent.click(view.getByRole("button", { name: "Next" }));
  await waitFor(() => assert.ok(view.getByLabelText("Extra value")));
  fireEvent.click(view.getByRole("button", { name: "Next" }));
  await waitFor(() => assert.ok(view.getByLabelText("Details")));
  fireEvent.click(view.getByRole("button", { name: "Toggle extra" }));
  assert.ok(view.getByLabelText("Details"));
  fireEvent.click(view.getByRole("button", { name: "Submit" }));
  await waitFor(() => assert.ok(view.getByText("Details required")));
  fireEvent.change(view.getByLabelText("Details"), {
    target: { value: "Complete" },
  });
  fireEvent.click(view.getByRole("button", { name: "Submit" }));
  await waitFor(() => assert.equal(saved.length, 1));
  assert.deepEqual(saved[0], {
    title: "Title",
    details: "Complete",
    files: [file],
    image: null,
    categories: ["law"],
    extra: "retained",
  });
});

test("wizard returns to the field with a server error and focuses it after mounting", async () => {
  const view = render(
    createElement(WizardFixture, { onSubmit: () => {}, serverError: true }),
    { wrapper },
  );
  fireEvent.click(view.getByRole("button", { name: "Toggle extra" }));
  fireEvent.click(view.getByRole("button", { name: "Next" }));
  await waitFor(() => assert.ok(view.getByLabelText("Details")));
  fireEvent.change(view.getByLabelText("Details"), {
    target: { value: "Complete" },
  });
  fireEvent.click(view.getByRole("button", { name: "Submit" }));
  await waitFor(() => assert.ok(view.getByText("Duplicate title")));
  await waitFor(() =>
    assert.equal(document.activeElement, view.getByLabelText("Title")),
  );
});

test("loaded files remain clean, and removed files/images are not restored after remount", async () => {
  const originalFetch = globalThis.fetch;
  let requests = 0;
  const saved: unknown[] = [];
  globalThis.fetch = async () => {
    requests++;
    return new Response(new Blob(["existing"], { type: "application/pdf" }));
  };
  try {
    const view = render(
      createElement(FileFixture, { onSubmit: (value) => saved.push(value) }),
      { wrapper },
    );
    await waitFor(() =>
      assert.ok(view.getByRole("link", { name: "existing.pdf" })),
    );
    await waitFor(() =>
      assert.ok(view.getByRole("button", { name: "Remove image" })),
    );
    assert.equal(view.getByTestId("dirty").textContent, "false");
    fireEvent.click(view.getByRole("button", { name: "Remove existing.pdf" }));
    fireEvent.click(view.getByRole("button", { name: "Remove image" }));
    fireEvent.click(view.getByRole("button", { name: "Toggle files" }));
    fireEvent.click(view.getByRole("button", { name: "Toggle files" }));
    fireEvent.click(view.getByRole("button", { name: "Save" }));
    await waitFor(() => assert.equal(saved.length, 1));
    assert.deepEqual(saved[0], { files: [], image: null });
    assert.equal(requests, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("ticket keyboard selection updates the conditional submission state", async () => {
  const view = render(createElement(TicketFixture), { wrapper });
  const first = view.getByRole("radio", { name: "Attend" });
  act(() => first.focus());
  fireEvent.keyDown(first, { key: "ArrowDown" });
  await waitFor(() =>
    assert.equal(view.getByTestId("submission").textContent, "true"),
  );
  assert.equal(
    view.getByRole("radio", { name: "Present" }).getAttribute("aria-checked"),
    "true",
  );
});

test("an editor update is submitted immediately, including its most recent text", async () => {
  const saved: unknown[] = [];
  const view = render(
    createElement(ControlsForm, {
      onSubmit: (value) => saved.push(value),
      editor: true,
    }),
    { wrapper },
  );
  const element = await waitFor(() =>
    view.getByRole("textbox", { name: "Description" }),
  );
  const editor = (element as HTMLElement & { editor: TiptapEditor }).editor;
  act(() => {
    editor.commands.setContent("<p>Latest content</p>", true);
    fireEvent.click(view.getByRole("button", { name: "Save" }));
  });
  await waitFor(() => assert.equal(saved.length, 1));
  assert.match((saved[0] as typeof defaults).description, /Latest content/);
});

test("combobox fetches, selects, creates, and exposes nested API errors without losing values", async () => {
  const saved: unknown[] = [],
    queries: string[] = [];
  const view = render(
    createElement(ComboboxFixture, {
      onSubmit: (value) => saved.push(value),
      fetchOptions: async (query) => {
        queries.push(query);
        return [{ id: "law", val: "Law" }];
      },
      createOption: async (text) =>
        text === "Invalid"
          ? {
              success: false,
              message: "Invalid option",
              errors: { "options.0": "Duplicate option" },
            }
          : {
              success: true,
              message: "Created",
              data: { id: text, val: text },
            },
    }),
    { wrapper },
  );
  const input = view.getByRole("combobox", { name: "Options" });
  assert.equal(
    document.getElementById(input.getAttribute("aria-describedby")!)
      ?.textContent,
    "Choose or create",
  );
  fireEvent.change(input, { target: { value: "La" } });
  await waitFor(() => assert.ok(queries.includes("La")));
  fireEvent.mouseDown(await view.findByRole("option", { name: "Law" }), {
    button: 0,
  });
  fireEvent.change(input, { target: { value: "New option" } });
  fireEvent.mouseDown(await view.findByRole("option", { name: /New option/ }), {
    button: 0,
  });
  await waitFor(() => assert.ok(view.getByText("New option")));
  fireEvent.keyDown(input, { key: "Escape" });
  fireEvent.click(view.getByRole("button", { name: "Save" }));
  await waitFor(() =>
    assert.deepEqual(saved, [{ options: ["Law", "New option"] }]),
  );
  fireEvent.change(input, { target: { value: "Invalid" } });
  fireEvent.mouseDown(await view.findByRole("option", { name: /Invalid/ }), {
    button: 0,
  });
  await waitFor(() => assert.ok(view.getByText("Duplicate option")));
  assert.equal(input.getAttribute("aria-invalid"), "true");
  fireEvent.change(input, { target: { value: "" } });
  fireEvent.keyDown(input, { key: "Backspace" });
  fireEvent.keyDown(input, { key: "Escape" });
  fireEvent.click(view.getByRole("button", { name: "Save" }));
  await waitFor(() => assert.deepEqual(saved[1], { options: ["Law"] }));
});
