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
import { useBreadcrumbStore } from "../src/stores/breadcrumbStore";

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

test("nested resource breadcrumbs show names while their links keep the original identifiers", () => {
  const view = render(createElement(TestTopBar, {
    path: "/en/flawis/conferences/annual-law/attendees/abc123",
    params: { slug: "annual-law", id: "abc123" },
    labels: [
      { param: "slug", value: "annual-law", path: "/flawis/conferences/annual-law", label: "Annual Law Conference" },
      { param: "id", value: "abc123", path: "/flawis/conferences/annual-law/attendees/abc123", label: "Jane Smith" },
    ],
  }));
  assert.equal(
    view.getByRole("link", { name: "Annual Law Conference" }).getAttribute("href"),
    "/en/flawis/conferences/annual-law",
  );
  assert.equal(
    view.getByText("Jane Smith", { selector: '[aria-current="page"]' }).getAttribute("title"),
    "Jane Smith",
  );
});

test("resource breadcrumbs update after renames and locale changes and discard previous route labels", () => {
  const props = {
    path: "/en/flawis/courses/course-id",
    params: { id: "course-id" },
    labels: [{ param: "id", value: "course-id", path: "/flawis/courses/course-id", label: "eLearning essentials" }],
  };
  const view = render(createElement(TestTopBar, props));
  assert.ok(view.getByText("eLearning essentials", { selector: '[aria-current="page"]' }));
  view.rerender(createElement(TestTopBar, {
    ...props,
    labels: [{ param: "id", value: "course-id", path: "/flawis/courses/course-id", label: "Updated course name" }],
  }));
  assert.ok(view.getByText("Updated course name", { selector: '[aria-current="page"]' }));

  view.rerender(createElement(TestTopBar, {
    path: "/sk/flawis/conferences/annual-law",
    lng: "sk",
    params: { slug: "annual-law" },
    labels: [{ param: "slug", value: "annual-law", path: "/flawis/conferences/annual-law", label: "Právnická konferencia" }],
  }));
  assert.ok(view.getByText("Právnická konferencia", { selector: '[aria-current="page"]' }));

  // A retained parallel route's name must not label a different resource type.
  view.rerender(createElement(TestTopBar, {
    path: "/en/flawis/users/course-id",
    params: { id: "course-id" },
    labels: [{ param: "slug", value: "course-id", path: "/flawis/conferences/course-id", label: "Old conference" }],
  }));
  assert.ok(view.getByText("Course-id", { selector: '[aria-current="page"]' }));
});

test("resource labels work on subdomain paths and fall back when the publisher unmounts", () => {
  const props = {
    path: "/en/company-id/applications/intern-id",
    params: { internshipId: "company-id", internId: "intern-id" },
    labels: [
      { param: "internshipId", value: "company-id", path: "/internships/company-id", label: "Example Legal Office" },
      { param: "internId", value: "intern-id", path: "/internships/company-id/applications/intern-id", label: "John Doe" },
    ],
  };
  const view = render(createElement(TestTopBar, props));
  assert.equal(
    view.getByRole("link", { name: "Example Legal Office" }).getAttribute("href"),
    "/en/company-id",
  );
  assert.ok(view.getByText("John Doe", { selector: '[aria-current="page"]' }));
  view.rerender(createElement(TestTopBar, { ...props, labels: [] }));
  assert.ok(view.getByText("Intern-id", { selector: '[aria-current="page"]' }));
});

test("a slug equal to a static segment only replaces the resource crumb", () => {
  const view = render(createElement(TestTopBar, {
    path: "/en/flawis/conferences/conferences",
    params: { slug: "conferences" },
    labels: [{ param: "slug", value: "conferences", path: "/flawis/conferences/conferences", label: "Law Symposium" }],
  }));
  assert.equal(
    view.getByRole("link", { name: "Conferences" }).getAttribute("href"),
    "/en/flawis/conferences",
  );
  assert.ok(view.getByText("Law Symposium", { selector: '[aria-current="page"]' }));

  view.rerender(createElement(TestTopBar, {
    path: "/en/register/register",
    params: { slug: "register" },
    labels: [{
      param: "slug", value: "register", path: "/conferences/register", label: "Law Symposium",
    }],
  }));
  assert.equal(
    view.getByRole("link", { name: "Law Symposium" }).getAttribute("href"),
    "/en/register",
  );
  assert.ok(view.getByText("Register", { selector: '[aria-current="page"]' }));
});

test("unrelated and equivalent registrations skip breadcrumb renders while visible names still update", (context) => {
  let commits = 0;
  const removers: (() => void)[] = [];
  context.after(() => act(() => removers.forEach((remove) => remove())));
  const view = render(createElement(TestTopBar, {
    path: "/en/flawis/courses/course-id",
    params: { id: "course-id" },
    labels: [{
      param: "id",
      value: "course-id",
      path: "/flawis/courses/course-id",
      label: "Course name",
    }],
    onRender: () => { commits += 1; },
  }));
  const register = useBreadcrumbStore.getState().registerLabel;
  const baseline = commits;

  act(() => {
    removers.push(register("unrelated-page", {
      param: "id",
      value: "another-id",
      path: "/flawis/courses/another-id",
      label: "Another course",
      lng: "en",
    }));
    removers.push(register("equivalent-modal", {
      param: "id",
      value: "course-id",
      path: "/flawis/courses/course-id",
      label: "Course name",
      lng: "en",
    }));
  });
  assert.equal(commits, baseline, "unchanged displayed labels do not commit a render");

  act(() => {
    removers.push(register("equivalent-modal", {
      param: "id",
      value: "course-id",
      path: "/flawis/courses/course-id",
      label: "Renamed course",
      lng: "en",
    }));
  });
  assert.ok(commits > baseline, "a changed visible name commits a render");
  assert.ok(view.getByText("Renamed course", { selector: '[aria-current="page"]' }));

  const renamedCommits = commits;
  act(() => removers[1]());
  assert.equal(commits, renamedCommits, "an older cleanup does not remove a newer registration");
  assert.ok(view.getByText("Renamed course", { selector: '[aria-current="page"]' }));

  act(() => removers[2]());
  assert.ok(view.getByText("Course name", { selector: '[aria-current="page"]' }));
});
