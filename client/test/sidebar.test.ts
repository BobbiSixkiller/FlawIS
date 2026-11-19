import "./helpers/dom";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import assert from "node:assert/strict";
import { afterEach, test, type TestContext } from "node:test";
import { createElement } from "react";
import { SidebarFixture } from "./helpers/sidebar-fixture";
import ThemeToggler from "../src/components/theme-toggler";
import { ThemeContext } from "../src/hooks/use-theme-preference";

afterEach(cleanup);

function mockViewport(context: TestContext, mobile = false) {
  context.mock.method(window, "matchMedia", (query: string) => ({
    matches: mobile,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => true,
  }));
}

// JSDOM does not implement matchMedia.
window.matchMedia ??= (() => ({})) as typeof window.matchMedia;

test("sidebar links identify the active section on localized and subdomain paths", (context) => {
  mockViewport(context);
  const view = render(createElement(SidebarFixture));
  assert.equal(
    view.getByRole("link", { name: "Users" }).getAttribute("aria-current"),
    "page",
  );
  assert.equal(
    view.getByRole("link", { name: "Courses" }).getAttribute("aria-current"),
    null,
  );

  view.rerender(
    createElement(SidebarFixture, { path: "/courses/12/attendance" }),
  );
  assert.equal(
    view.getByRole("link", { name: "Courses" }).getAttribute("aria-current"),
    "page",
  );
  view.rerender(createElement(SidebarFixture, { path: "/en/courses-archive" }));
  assert.equal(
    view.getByRole("link", { name: "Courses" }).getAttribute("aria-current"),
    null,
  );
});

test("desktop collapse retains navigation and footer controls and persists its state", (context) => {
  mockViewport(context);
  const view = render(createElement(SidebarFixture));
  fireEvent.click(view.getByRole("button", { name: "Toggle navigation" }));
  assert.ok(
    view.container.querySelector(
      '[data-slot="sidebar"][data-collapsible="icon"]',
    ),
  );
  assert.ok(view.getByRole("link", { name: "Users" }));
  assert.ok(view.getByRole("button", { name: "Preferences" }));
  assert.match(document.cookie, /sidebar_state=false/);
  fireEvent.click(view.getByRole("button", { name: "Toggle navigation" }));
  assert.match(document.cookie, /sidebar_state=true/);
});

test("mobile navigation closes after choosing a link", async (context) => {
  mockViewport(context, true);
  const view = render(createElement(SidebarFixture));
  fireEvent.click(view.getByRole("button", { name: "Toggle navigation" }));
  const link = await view.findByRole("link", { name: "Courses" });

  // Prevent JSDOM navigation after the component's click handler has run.
  document.addEventListener("click", (event) => event.preventDefault(), {
    once: true,
  });

  fireEvent.click(link);
  assert.equal(view.queryByRole("dialog"), null);
});

test("Escape closes the theme picker before the mobile sidebar", async (context) => {
  mockViewport(context, true);
  const footer = createElement(
    ThemeContext.Provider,
    { value: { preference: "light", pending: false, setPreference() {} } },
    createElement(ThemeToggler, { lng: "en" }),
  );
  const view = render(createElement(SidebarFixture, { footer }));
  fireEvent.click(view.getByRole("button", { name: "Toggle navigation" }));
  const trigger = await view.findByRole("button", { name: /theme:/i });
  fireEvent.click(trigger);
  const selected = await view.findByRole("radio", { checked: true });
  await waitFor(() => assert.ok(document.activeElement === selected));
  fireEvent.keyDown(selected, { key: "Escape" });
  await waitFor(() => assert.ok(document.activeElement === trigger));
  assert.ok(view.getByRole("dialog"));
  fireEvent.keyDown(trigger, { key: "Escape" });
  await waitFor(() => assert.ok(!view.queryByRole("dialog")));
});

test("the sidebar shortcut leaves rich-text formatting and input shortcuts alone", (context) => {
  mockViewport(context);
  const view = render(createElement(SidebarFixture));
  const editor = document.createElement("div");
  editor.contentEditable = "true";
  editor.setAttribute("contenteditable", "true");
  view.container.append(editor);
  fireEvent.keyDown(editor, { key: "b", ctrlKey: true });
  assert.equal(
    view.container.querySelector(
      '[data-slot="sidebar"][data-collapsible="icon"]',
    ),
    null,
  );
  fireEvent.keyDown(window, { key: "b", ctrlKey: true });
  assert.ok(
    view.container.querySelector(
      '[data-slot="sidebar"][data-collapsible="icon"]',
    ),
  );
});
