import "./helpers/dom";
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createElement } from "react";
import { TestTopBar } from "./helpers/topbar-fixtures";

afterEach(cleanup);

test("shared header keeps the participant logo as localized Home and preserves its login destination", () => {
  const view = render(createElement(TestTopBar));
  assert.equal(
    view.getByRole("link", { name: "Home" }).getAttribute("href"),
    "/en",
  );
  assert.equal(view.queryByRole("button", { name: "Open navigation" }), null);
  assert.equal(
    view.getByRole("link", { name: "Log in" }).getAttribute("href"),
    "/login?returnTo=internships",
  );
  assert.equal(
    view.getByRole("link", { name: "Internships" }).getAttribute("href"),
    "/en/flawis/internships",
  );
  assert.equal(
    view.getByText("Update", { selector: '[aria-current="page"]' }).tagName,
    "SPAN",
  );
});

test("the dashboard drawer closes when navigating", async () => {
  const view = render(createElement(TestTopBar, { drawer: true }));
  fireEvent.click(view.getByRole("button", { name: "Open navigation" }));
  await view.findByRole("dialog");
  view.rerender(
    createElement(TestTopBar, { drawer: true, path: "/en/flawis/users" }),
  );
  assert.equal(
    view
      .getByRole("button", { name: "Open navigation", hidden: true })
      .getAttribute("aria-expanded"),
    "false",
  );
});

test("breadcrumbs collapse, expose the full path, and expand again when space returns", async (context) => {
  let width = 220;
  const observers = new Set<() => void>();
  const originalResizeObserver = globalThis.ResizeObserver;
  context.after(() => {
    globalThis.ResizeObserver = originalResizeObserver;
  });
  globalThis.ResizeObserver = class {
    constructor(private callback: ResizeObserverCallback) {}
    observe(element: Element) {
      if (element.tagName === "NAV") observers.add(this.resize);
    }
    private resize = () => this.callback([], this);
    unobserve() {}
    disconnect() {
      observers.delete(this.resize);
    }
  };
  context.mock.method(
    HTMLElement.prototype,
    "getBoundingClientRect",
    function (this: HTMLElement) {
      const measuredWidth =
        this.tagName === "NAV"
          ? width
          : this.tagName === "OL" && this.parentElement?.hasAttribute("inert")
            ? this.children.length > 3
              ? 500
              : 100
            : 80;
      return {
        width: measuredWidth,
        height: 36,
        top: 0,
        bottom: 36,
        left: 0,
        right: measuredWidth,
        x: 0,
        y: 0,
        toJSON() {},
      };
    },
  );
  const view = render(createElement(TestTopBar));
  const trigger = view.getByRole("button", { name: "Show full navigation" });
  assert.ok(view.getByRole("link", { name: "Home" }));
  assert.equal(view.queryByRole("link", { name: "Internships" }), null);
  fireEvent.click(trigger);
  const popup = await view.findByRole("dialog", {
    name: "Show full navigation",
  });
  assert.equal(
    within(popup)
      .getByRole("link", { name: "Internships" })
      .getAttribute("href"),
    "/en/flawis/internships",
  );
  assert.ok(
    within(popup).getByText("Update", { selector: '[aria-current="page"]' }),
  );
  fireEvent.keyDown(trigger, { key: "Escape" });
  await waitFor(() => assert.equal(view.queryByRole("dialog"), null));
  act(() => {
    width = 800;
    assert.ok(
      observers.size > 0,
      "breadcrumb resize observer remains subscribed",
    );
    observers.forEach((callback) => callback());
  });
  assert.equal(
    view.queryByRole("button", { name: "Show full navigation" }),
    null,
  );
  assert.ok(view.getByRole("link", { name: "Internships" }));
});

test("the locale root contains only Home and updates translated breadcrumbs on navigation", async () => {
  const view = render(createElement(TestTopBar, { path: "/en" }));
  assert.equal(
    view.getByRole("link", { name: "Home" }).getAttribute("aria-current"),
    "page",
  );
  assert.equal(
    view.queryByRole("button", { name: "Show full navigation" }),
    null,
  );
  view.rerender(
    createElement(TestTopBar, { lng: "sk", path: "/sk/internships" }),
  );
  const nav = await view.findByRole("navigation", { name: "Navigácia" });
  assert.equal(within(nav).getByRole("link").getAttribute("href"), "/");
  assert.ok(
    within(nav).getByText("Stáže", { selector: '[aria-current="page"]' }),
  );
});
