import "./helpers/dom";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createElement } from "react";
import { cleanup, render, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TemplateEditor from "../src/app/[lng]/flawis/conferences/[slug]/templates/_components/template-editor";
import { ManuscriptTemplateDownload } from "../src/app/[lng]/conferences/[slug]/_components/manuscript-template-download";

afterEach(cleanup);

test("template upload validates file, focuses the error, and guards an unsaved selection", async () => {
  let uploads = 0;
  const user = userEvent.setup();
  const view = render(
    createElement(TemplateEditor, {
      lng: "en",
      title: "Manuscript template",
      description: "For authors",
      onClose() {},
      onSave: async () => {},
      onUpload: async () => {
        uploads++;
        return { id: "file" };
      },
    }),
  );
  await user.click(view.getByRole("button", { name: "Save changes" }));
  const input = view.getByLabelText("DOCX file") as HTMLInputElement;
  await waitFor(() => assert.equal(document.activeElement, input));
  assert.ok(view.getByText("Choose a DOCX file."));
  for (const [file, message] of [
    [new File(["pdf"], "bad.pdf"), "Choose a DOCX file."],
    [new File([], "empty.docx"), "The file is empty."],
    [
      new File([new Uint8Array(20 * 1024 * 1024 + 1)], "big.docx"),
      "Maximum file size: 20 MiB.",
    ],
  ] as const) {
    fireEvent.change(input, { target: { files: [file] } });
    await user.click(view.getByRole("button", { name: "Save changes" }));
    assert.ok(await view.findByText(message));
  }
  assert.equal(uploads, 0);
  fireEvent.change(input, {
    target: { files: [new File(["docx"], "valid.docx")] },
  });
  await user.click(view.getByRole("button", { name: "Cancel" }));
  assert.ok(await view.findByRole("alertdialog"));
});

test("a failed template save keeps the file and reuses its completed upload on retry", async () => {
  let uploads = 0,
    saves = 0,
    closes = 0;
  const user = userEvent.setup();
  const file = new File(["document"], "official.docx");
  const view = render(
    createElement(TemplateEditor, {
      lng: "en",
      title: "Review report template",
      description: "For exports",
      onClose() {
        closes++;
      },
      onUpload: async (selected) => {
        assert.equal(selected, file);
        uploads++;
        return { id: "uploaded-file" };
      },
      onSave: async (id) => {
        assert.equal(id, "uploaded-file");
        if (++saves === 1) throw new Error("Retry this save");
      },
    }),
  );
  fireEvent.change(view.getByLabelText("DOCX file"), {
    target: { files: [file] },
  });
  await user.click(view.getByRole("button", { name: "Save changes" }));
  assert.ok(await view.findByText("Retry this save"));
  assert.equal(closes, 0);
  await user.click(view.getByRole("button", { name: "Save changes" }));
  await waitFor(() => assert.equal(closes, 1));
  assert.equal(saves, 2);
  assert.equal(uploads, 1);
});

test("failed uploads can be retried and replacing the selection uploads the new file", async () => {
  const uploaded: string[] = [];
  const user = userEvent.setup();
  const view = render(
    createElement(TemplateEditor, {
      lng: "sk",
      title: "Šablóna príspevku",
      description: "Pre autorov",
      onClose() {},
      onUpload: async (file) => {
        uploaded.push(file.name);
        if (uploaded.length === 1) throw new Error("Skúste znova");
        return { id: file.name };
      },
      onSave: async () => {
        throw new Error("Uloženie zlyhalo");
      },
    }),
  );
  const input = view.getByLabelText("DOCX súbor");
  fireEvent.change(input, {
    target: { files: [new File(["one"], "one.docx")] },
  });
  await user.click(view.getByRole("button", { name: "Uložiť zmeny" }));
  assert.ok(await view.findByText("Skúste znova"));
  await user.click(view.getByRole("button", { name: "Uložiť zmeny" }));
  assert.ok(await view.findByText("Uloženie zlyhalo"));
  fireEvent.change(input, {
    target: { files: [new File(["two"], "two.docx")] },
  });
  await user.click(view.getByRole("button", { name: "Uložiť zmeny" }));
  await waitFor(() =>
    assert.deepEqual(uploaded, ["one.docx", "one.docx", "two.docx"]),
  );
});

test("author downloads use the current conference template endpoint in either language", () => {
  const conference = {
    id: "conference-id",
    manuscriptTemplateFile: "private-file-id",
  };
  for (const lng of ["sk", "en"]) {
    const view = render(
      createElement(ManuscriptTemplateDownload, { conference, lng }),
    );
    assert.equal(
      view.getByRole("link").getAttribute("href"),
      "/api/conference-review/templates/conference-id/manuscript",
    );
    view.unmount();
  }
  const view = render(
    createElement(ManuscriptTemplateDownload, {
      conference: { id: "no-template" },
      lng: "en",
    }),
  );
  assert.equal(view.queryByRole("link"), null);
});
