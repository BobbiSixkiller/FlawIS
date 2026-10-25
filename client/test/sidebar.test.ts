import "./helpers/dom";
import { cleanup, fireEvent, render } from "@testing-library/react";
import assert from "node:assert/strict";
import { afterEach, test, type TestContext } from "node:test";
import { createElement } from "react";
import { SidebarFixture } from "./helpers/sidebar-fixture";

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
