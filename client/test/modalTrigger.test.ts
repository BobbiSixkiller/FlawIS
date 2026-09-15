import "./helpers/dom";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { PassThrough } from "node:stream";
import { createElement, Fragment, type ReactNode } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { cleanup, fireEvent, render } from "@testing-library/react";
import ModalTrigger from "../src/components/ModalTrigger";
import { useDialogStore } from "../src/stores/dialogStore";

afterEach(() => {
  cleanup();
  useDialogStore.setState({ openDialogs: {} });
});

function renderServer(children: ReactNode): Promise<string> {
  return new Promise((resolve, reject) => {
    const output = new PassThrough();
    let html = "";
    output.on("data", (chunk) => {
      html += chunk.toString();
    });
    output.on("end", () => resolve(html));
    output.on("error", reject);
    const stream = renderToPipeableStream(children, {
      onAllReady() {
        stream.pipe(output);
      },
      onError(error) {
        reject(error);
      },
      onShellError(error) {
        reject(error);
      },
    });
  });
}

test("modal triggers server-render streamed fragment content without recovering on the client", async () => {
  const content = Promise.resolve(
    createElement(
      Fragment,
      null,
      createElement("svg", { "aria-hidden": true }),
      "Invite institution",
    ),
  );
  const html = await renderServer(
    createElement(
      ModalTrigger,
      {
        dialogId: "invite",
        variant: "secondary",
        size: "sm",
      },
      content,
    ),
  );
  const container = document.createElement("div");
  container.innerHTML = html;
  assert.equal(container.querySelectorAll("button").length, 1);
  const button = container.querySelector("button")!;
  assert.equal(button.type, "button");
  assert.equal(button.textContent, "Invite institution");
  assert.ok(button.querySelector("svg"));
  assert.doesNotMatch(
    html,
    /Switched to client rendering|data-msg|Passing props/,
  );
});

test("unstyled table triggers preserve native button layout during server rendering", async () => {
  const html = await renderServer(
    createElement(
      ModalTrigger,
      {
        dialogId: "session",
        unstyled: true,
        className: "w-full text-center",
      },
      "Session",
    ),
  );
  const container = document.createElement("div");
  container.innerHTML = html;
  const button = container.querySelector("button")!;
  assert.equal(button.className, "w-full text-center");
  assert.equal(button.type, "button");
});

test("disabled and cancelled triggers do not open dialogs", () => {
  const view = render(
    createElement(
      ModalTrigger,
      {
        dialogId: "edit",
        disabled: true,
      },
      "Edit",
    ),
  );
  fireEvent.click(view.getByRole("button", { name: "Edit" }));
  assert.equal(useDialogStore.getState().isDialogOpen("edit"), false);
  view.rerender(
    createElement(
      ModalTrigger,
      {
        dialogId: "edit",
        onClick: (event) => event.preventDefault(),
      },
      "Edit",
    ),
  );
  fireEvent.click(view.getByRole("button", { name: "Edit" }));
  assert.equal(useDialogStore.getState().isDialogOpen("edit"), false);
});
