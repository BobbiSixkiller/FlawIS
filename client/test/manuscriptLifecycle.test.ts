import "./helpers/dom";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createElement } from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import RevisionPortalView from "../src/app/[lng]/conferences/_components/revision-portal";
import type { RevisionPortal } from "../src/lib/reviews/types";

afterEach(cleanup);
const request: RevisionPortal = {
  id: "paper-request",
  deadline: "2026-12-15",
  status: "REQUESTED",
  instructions: "Clarify the observation unit.",
  note: "",
  kind: "POST_REVIEW",
};

test("a post-review correction enables submission only after selecting both manuscript files", () => {
  const view = render(
    createElement(RevisionPortalView, {
      initial: request,
      submission: "paper",
      lng: "en",
    }),
  );

  const inputs = view.container.querySelectorAll("input[type=file]");
  const submit = view.getByRole("button", {
    name: "Submit revision",
  }) as HTMLButtonElement;
  assert.equal(inputs.length, 2);

  fireEvent.change(inputs[0], {
    target: { files: [new File(["clean"], "clean.docx")] },
  });

  assert.equal(submit.disabled, true);

  fireEvent.change(inputs[1], {
    target: { files: [new File(["tracked"], "tracked.docx")] },
  });

  assert.equal(submit.disabled, false);
});

test("a formal correction accepts one file", () => {
  const view = render(
    createElement(RevisionPortalView, {
      initial: { ...request, kind: "FORMAL" },
      submission: "paper",
      lng: "sk",
    }),
  );

  const inputs = view.container.querySelectorAll("input[type=file]");
  assert.equal(inputs.length, 1);

  fireEvent.change(inputs[0], {
    target: { files: [new File(["clean"], "clean.docx")] },
  });

  assert.equal(
    (view.getByRole("button", { name: "Odovzdať opravu" }) as HTMLButtonElement)
      .disabled,
    false,
  );
});

test("an author sees the identified final Word and PDF before approving that proof", async (t) => {
  const proof = {
    ...request,
    kind: "PROOF",
    versionNumber: 3,
    manuscriptFile: "word",
    proofPdf: "pdf",
  };
  const send = t.mock.method(globalThis, "fetch", async () =>
    Response.json({ ...proof, status: "APPROVED" }),
  );

  const view = render(
    createElement(RevisionPortalView, {
      initial: proof,
      submission: "paper",
      lng: "en",
    }),
  );

  assert.ok(view.getByText(/Version 3/));
  assert.match(
    view
      .getByRole("link", { name: "Final manuscript (DOCX)" })
      .getAttribute("href")!,
    /word$/,
  );
  assert.match(
    view.getByRole("link", { name: "Page proof (PDF)" }).getAttribute("href")!,
    /pdf$/,
  );

  fireEvent.click(
    view.getByRole("button", {
      name: "I approve this version for publication",
    }),
  );

  await view.findByRole("status");
  assert.equal(send.mock.calls.length, 1);
});
