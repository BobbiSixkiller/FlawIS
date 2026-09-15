import "./helpers/dom";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createElement, createRef } from "react";
import { useDialogStore } from "../src/stores/dialogStore";
import {
  ActionDropdown,
  LanguageDropdown,
  StreamedActionDropdown,
  StreamedLinkDropdown,
} from "./helpers/dropdown-fixtures";

afterEach(() => {
  cleanup();
  useDialogStore.setState({ openDialogs: {} });
});

test("streamed server menu items resolve to the interactive link", async () => {
  const view = render(createElement(StreamedLinkDropdown));
  fireEvent.click(view.getByRole("button", { name: "Streamed links" }));
  const item = await view.findByRole("menuitem", { name: "Streamed link" });
  assert.equal(item.tagName, "A");
  assert.equal(item.getAttribute("href"), "#streamed");
  fireEvent.click(item);
  assert.equal(
    view
      .getByRole("button", { name: "Streamed links" })
      .getAttribute("aria-expanded"),
    "false",
  );
});

test("streamed modal buttons retain their ref and activate inside dropdowns", async () => {
  const ref = createRef<HTMLButtonElement>();
  const view = render(
    createElement(StreamedActionDropdown, { buttonRef: ref }),
  );
  await act(async () => {
    fireEvent.click(view.getByRole("button", { name: "Streamed actions" }));
  });
  const item = await view.findByRole("menuitem", { name: "Streamed edit" });
  assert.equal(item, ref.current);
  assert.equal(item.tagName, "BUTTON");
  assert.equal(item.querySelector("button"), null);
  fireEvent.click(item);
  assert.equal(useDialogStore.getState().isDialogOpen("streamed-edit"), true);
  assert.equal(
    view
      .getByRole("button", { name: "Streamed actions" })
      .getAttribute("aria-expanded"),
    "false",
  );
});

for (const activation of ["click", "keyboard"] as const) {
  test(`dropdown links navigate once on ${activation} and close the menu`, async () => {
    let navigations = 0;
    const view = render(
      createElement(LanguageDropdown, { onClick: () => navigations++ }),
    );
    fireEvent.click(view.getByRole("button", { name: "Language" }));
    const item = await view.findByRole("menuitem", { name: "English" });
    if (activation === "click") {
      // Touch release activates the registered menu item itself.
      fireEvent.click(item);
    } else {
      const menu = view.getByRole("menu");
      fireEvent.keyDown(menu, { key: "ArrowDown" });
      fireEvent.keyDown(menu, { key: "Enter" });
    }
    assert.equal(navigations, 1);
    assert.equal(
      view
        .getByRole("button", { name: "Language" })
        .getAttribute("aria-expanded"),
      "false",
    );
  });
}

test("modal dropdown items forward menu behavior and refs to their buttons", async () => {
  const ref = createRef<HTMLButtonElement>();
  let clicks = 0;
  const view = render(
    createElement(ActionDropdown, {
      buttonRef: ref,
      onClick: () => clicks++,
    }),
  );
  fireEvent.click(view.getByRole("button", { name: "Actions" }));
  const item = await view.findByRole("menuitem", { name: "Edit" });
  assert.equal(item, ref.current);
  assert.equal(item.tagName, "BUTTON");
  fireEvent.keyDown(view.getByRole("menu"), { key: "ArrowDown" });
  fireEvent.keyDown(view.getByRole("menu"), { key: "Enter" });
  assert.equal(clicks, 1);
  assert.equal(useDialogStore.getState().isDialogOpen("edit"), true);
  assert.equal(
    view.getByRole("button", { name: "Actions" }).getAttribute("aria-expanded"),
    "false",
  );
});

test("export dropdown items start one download and close the menu", async (context) => {
  const originalURL = window.URL;
  window.URL = URL;
  context.after(() => {
    window.URL = originalURL;
  });
  const fetchMock = context.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response("name\nExample", {
        headers: { "content-disposition": 'attachment; filename="export.csv"' },
      }),
  );
  context.mock.method(URL, "createObjectURL", () => "#download");
  const revokeMock = context.mock.method(URL, "revokeObjectURL", () => {});
  const view = render(
    createElement(ActionDropdown, { buttonRef: null, onClick: () => {} }),
  );
  fireEvent.click(view.getByRole("button", { name: "Actions" }));
  const item = await view.findByRole("menuitem", { name: ".csv" });
  assert.equal(item.tagName, "BUTTON");
  fireEvent.click(item);
  await waitFor(() => assert.equal(revokeMock.mock.callCount(), 1));
  assert.equal(fetchMock.mock.callCount(), 1);
  assert.equal(fetchMock.mock.calls[0].arguments[0], "/export");
  assert.equal(
    view.getByRole("button", { name: "Actions" }).getAttribute("aria-expanded"),
    "false",
  );
});
