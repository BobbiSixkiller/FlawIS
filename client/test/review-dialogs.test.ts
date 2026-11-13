import "./helpers/dom";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createElement, useState } from "react";
import { cleanup, render, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { z } from "zod";
import { Toaster, createToastManager } from "../src/components/ui/toast";
import { FormDialog, TextField } from "../src/components/form/form-dialog";
import {
  AnswerFields,
  validateAnswerFields,
} from "../src/components/form/answer-fields";
import {
  FieldType,
  type FormFragment,
} from "../src/lib/graphql/generated/graphql";
afterEach(cleanup);
test("notifications render their message and can be dismissed", async () => {
  const manager = createToastManager();
  const user = userEvent.setup();
  const view = render(
    createElement(
      Toaster,
      { toastManager: manager },
      createElement(
        "button",
        {
          onClick: () =>
            manager.add({
              title: "Email queued.",
              description: "Delivery has not been confirmed.",
              type: "success",
            }),
        },
        "Notify",
      ),
    ),
  );
  await user.click(view.getByRole("button", { name: "Notify" }));
  assert.ok(await view.findByText("Email queued."));
  assert.ok(view.getByText("Delivery has not been confirmed."));
  await user.keyboard("{F6}");
  await user.click(view.getByRole("button", { name: "Dismiss notification" }));
  await waitFor(() => assert.equal(view.queryByText("Email queued."), null));
});
const schema = z.object({ reason: z.string().trim().min(1, "Enter a reason") });
function dialog(
  onSubmit: (v: { reason: string }) => Promise<unknown>,
  onClose = () => {},
  key = "paper-a",
) {
  // The component deliberately accepts a render function, not a ReactNode child.
  // eslint-disable-next-line react/no-children-prop
  return createElement(FormDialog<{ reason: string }>, {
    key,
    title: "Record decision",
    lng: "en",
    schema,
    defaultValues: { reason: "" },
    onSubmit,
    onClose,
    children: () =>
      createElement(TextField, { name: "reason", label: "Reason" }),
  });
}
test("dialog validates and focuses the field; failed saves retain the draft inside the dialog", async () => {
  const user = userEvent.setup();
  let calls = 0;
  const view = render(
    dialog(async () => {
      calls++;
      throw new Error("Service unavailable");
    }),
  );
  await user.click(view.getByRole("button", { name: "Save changes" }));
  assert.equal(calls, 0);
  await waitFor(() =>
    assert.equal(
      document.activeElement,
      view.getByRole("textbox", { name: "Reason" }),
    ),
  );
  assert.ok(view.getByText("Enter a reason"));
  await user.type(
    view.getByRole("textbox", { name: "Reason" }),
    "Needs changes",
  );
  await user.click(view.getByRole("button", { name: "Save changes" }));
  await waitFor(() => assert.equal(calls, 1));
  assert.ok(
    view.getByRole("dialog").contains(view.getByText("Service unavailable")),
  );
  assert.equal(
    (view.getByRole("textbox", { name: "Reason" }) as HTMLInputElement).value,
    "Needs changes",
  );
});
test("dirty close requires a discard decision and keep editing retains values", async () => {
  const user = userEvent.setup();
  let closed = false;
  const view = render(
    dialog(
      async () => {},
      () => {
        closed = true;
      },
    ),
  );
  await user.type(view.getByRole("textbox", { name: "Reason" }), "Draft");
  await user.click(view.getByRole("button", { name: "Cancel" }));
  assert.ok(view.getByRole("alertdialog"));
  assert.equal(closed, false);
  await user.click(view.getByRole("button", { name: "Keep editing" }));
  await waitFor(() => assert.equal(view.queryByRole("alertdialog"), null));
  assert.equal(
    (view.getByRole("textbox", { name: "Reason" }) as HTMLInputElement).value,
    "Draft",
  );
  await user.click(view.getByRole("button", { name: "Cancel" }));
  await user.click(view.getByRole("button", { name: "Discard changes" }));
  assert.equal(closed, true);
});
test("saving blocks duplicate submissions and clean reopening for another paper resets fields", async () => {
  const user = userEvent.setup();
  let calls = 0;
  let resolve!: () => void;
  const saved = new Promise<void>((r) => {
    resolve = r;
  });
  const view = render(
    dialog(async () => {
      calls++;
      await saved;
    }),
  );
  await user.type(view.getByRole("textbox", { name: "Reason" }), "Paper A");
  await user.click(view.getByRole("button", { name: "Save changes" }));
  await waitFor(() =>
    assert.ok(
      (view.getByRole("button", { name: "Saving…" }) as HTMLButtonElement)
        .disabled,
    ),
  );
  assert.ok(
    (view.getByRole("button", { name: "Cancel" }) as HTMLButtonElement)
      .disabled,
  );
  resolve();
  await waitFor(() =>
    assert.ok(view.getByRole("button", { name: "Save changes" })),
  );
  assert.equal(calls, 1);
  view.rerender(
    dialog(
      async () => {},
      () => {},
      "paper-b",
    ),
  );
  assert.equal(
    (view.getByRole("textbox", { name: "Reason" }) as HTMLInputElement).value,
    "",
  );
});
test("review answer visibility and upload busy state are explicit and validation permits incomplete drafts", async () => {
  let finish!: (id: string) => void;
  const busy: boolean[] = [];
  const fields = [
    {
      id: "public",
      label: "Comments",
      type: FieldType.Textarea,
      required: true,
    },
    {
      id: "private",
      label: "Internal note",
      type: FieldType.Text,
      required: false,
    },
    {
      id: "file",
      label: "Attachment",
      type: FieldType.FileUpload,
      required: false,
    },
  ].map((f) => ({
    placeholder: null,
    helpText: null,
    selectOptions: null,
    minFiles: null,
    maxFiles: 1,
    ...f,
  })) satisfies FormFragment["fields"];
  function Fixture() {
    const [values, setValues] = useState<Record<string, string | string[]>>({});
    return createElement(AnswerFields, {
      fields,
      fieldAnnotations: {
        public: "Visible to authors",
        private: "Coordinators only",
        file: "Coordinators only",
      },
      values,
      onChange: (id, value) =>
        setValues((current) => ({ ...current, [id]: value })),
      onUploadingChange: (value) => busy.push(value),
      upload: () =>
        new Promise<string>((r) => {
          finish = r;
        }),
    });
  }
  const view = render(createElement(Fixture));
  assert.equal(view.getAllByText("Visible to authors").length, 1);
  assert.equal(view.getAllByText("Coordinators only").length, 2);
  assert.deepEqual(validateAnswerFields(fields, {}, "en"), {
    public: "Complete this required answer.",
  });
  fireEvent.change(view.getByLabelText("Attachment", { selector: "input" }), {
    target: { files: [new File(["test"], "review.pdf")] },
  });
  await waitFor(() => assert.deepEqual(busy, [true]));
  finish("file-id");
  await waitFor(() => assert.deepEqual(busy, [true, false]));
  assert.ok(view.getByText("review.pdf"));
});
