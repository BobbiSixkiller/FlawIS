import "./helpers/dom";
import {
  act,
  cleanup,
  fireEvent,
  render,
  within,
} from "@testing-library/react";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createElement } from "react";
import { UrlFilterFixture } from "./helpers/url-filter-fixture";

afterEach(cleanup);

test("category selection and clear preserve other URL parameters without scrolling", async () => {
  const navigations: { href: string; scroll?: boolean }[] = [];
  const view = render(
    createElement(UrlFilterFixture, {
      initialQuery: "view=compact",
      onNavigate: (href, scroll) => navigations.push({ href, scroll }),
    }),
  );
  assert.equal(view.queryByRole("button", { name: "Clear all" }), null);
  fireEvent.click(view.getByRole("button", { name: "Categories" }));
  const law = await view.findByRole("switch", { name: "Law" });
  const panel = within(view.getByRole("dialog", { name: "Categories" }));
  const clear = panel.getByRole("button", {
    name: "Clear all",
  }) as HTMLButtonElement;
  assert.equal(clear.disabled, true);
  await act(async () => {
    fireEvent.click(law);
  });
  await act(async () => {
    fireEvent.click(view.getByRole("switch", { name: "IT" }));
  });
  assert.deepEqual(
    new URL(navigations.at(-1)!.href, "http://localhost").searchParams.getAll(
      "category",
    ),
    ["law", "it"],
  );
  assert.ok(navigations.every((navigation) => navigation.scroll === false));
  assert.equal(law.getAttribute("aria-checked"), "true");
  assert.equal(clear.disabled, false);
  assert.equal(view.queryByRole("list", { name: "Selected categories" }), null);
  await act(async () => {
    fireEvent.click(clear);
  });
  assert.equal(navigations.at(-1)!.href, "/en?view=compact");
  assert.equal(clear.disabled, true);
  assert.equal(law.getAttribute("aria-checked"), "false");
  assert.equal(
    panel.getByRole("switch", { name: "IT" }).getAttribute("aria-checked"),
    "false",
  );
  assert.equal(
    view
      .getByRole("button", { name: "Categories" })
      .getAttribute("aria-expanded"),
    "true",
  );
  await act(async () => {
    law.focus();
    fireEvent.keyDown(law, { key: "Escape" });
  });
  assert.equal(
    view
      .getByRole("button", { name: "Categories" })
      .getAttribute("aria-expanded"),
    "false",
  );
});

test("duplicate and unavailable categories can be removed from a bookmarked filter", async () => {
  const navigations: string[] = [];
  const view = render(
    createElement(UrlFilterFixture, {
      initialQuery: "category=missing&category=law&category=law",
      onNavigate: (href) => navigations.push(href),
    }),
  );
  fireEvent.click(view.getByRole("button", { name: "Categories 2" }));
  const law = await view.findByRole("switch", { name: "Law" });
  assert.equal(law.getAttribute("aria-checked"), "true");
  await act(async () => {
    fireEvent.click(view.getByRole("button", { name: "Clear all" }));
  });
  assert.equal(navigations.at(-1), "/en");
  assert.equal(law.getAttribute("aria-checked"), "false");
  assert.ok(view.getByRole("button", { name: "Categories" }));
});

test("an empty category list has a clear empty state", async () => {
  const view = render(
    createElement(UrlFilterFixture, {
      filters: [
        {
          label: "Categories",
          queryKey: "category",
          type: "multi",
          options: [],
        },
      ],
      onNavigate: () => {},
    }),
  );
  fireEvent.click(view.getByRole("button", { name: "Categories" }));
  await view.findByText("No options available.");
  assert.equal(view.queryByRole("switch"), null);
});

test("boolean and single filters stay synchronized and clear only their configured URL keys", async () => {
  const navigations: string[] = [];
  const view = render(
    createElement(UrlFilterFixture, {
      label: "Filters",
      initialQuery: "academicYear=2026&organization=Faculty",
      filters: [
        { label: "Passive attendees", queryKey: "passive", type: "boolean" },
        {
          label: "Status",
          queryKey: "status",
          type: "single",
          options: [
            { label: "Active", value: "active" },
            { label: "Archived", value: "archived" },
          ],
        },
      ],
      onNavigate: (href) => navigations.push(href),
    }),
  );
  fireEvent.click(view.getByRole("button", { name: "Filters" }));
  const passive = await view.findByRole("switch", {
    name: "Passive attendees",
  });
  const active = view.getByRole("button", { name: "Active" });
  const archived = view.getByRole("button", { name: "Archived" });
  await act(async () => {
    fireEvent.click(passive);
  });
  assert.equal(passive.getAttribute("aria-checked"), "true");
  await act(async () => {
    fireEvent.click(active);
  });
  assert.equal(active.getAttribute("aria-pressed"), "true");
  await act(async () => {
    fireEvent.click(archived);
  });
  assert.equal(active.getAttribute("aria-pressed"), "false");
  assert.equal(archived.getAttribute("aria-pressed"), "true");
  assert.deepEqual(
    new URL(navigations.at(-1)!, "http://localhost").searchParams.getAll(
      "status",
    ),
    ["archived"],
  );
  await act(async () => {
    fireEvent.click(archived);
  });
  assert.equal(archived.getAttribute("aria-pressed"), "false");
  assert.equal(
    new URL(navigations.at(-1)!, "http://localhost").searchParams.has("status"),
    false,
  );
  await act(async () => {
    fireEvent.click(active);
  });
  await act(async () => {
    fireEvent.click(view.getByRole("button", { name: "Clear all" }));
  });
  assert.equal(
    navigations.at(-1),
    "/en?academicYear=2026&organization=Faculty",
  );
  assert.equal(passive.getAttribute("aria-checked"), "false");
  assert.equal(active.getAttribute("aria-pressed"), "false");
  await act(async () => {
    fireEvent.click(passive);
  });
  await act(async () => {
    fireEvent.click(passive);
  });
  assert.equal(
    navigations.at(-1),
    "/en?academicYear=2026&organization=Faculty",
  );
});

test("switches follow external URL changes while the popover is open", async () => {
  const onNavigate = () => {};
  const view = render(
    createElement(UrlFilterFixture, { onNavigate, query: "category=law" }),
  );
  fireEvent.click(view.getByRole("button", { name: "Categories 1" }));
  const law = await view.findByRole("switch", { name: "Law" });
  assert.equal(law.getAttribute("aria-checked"), "true");
  view.rerender(
    createElement(UrlFilterFixture, { onNavigate, query: "category=it" }),
  );
  assert.equal(law.getAttribute("aria-checked"), "false");
  assert.equal(
    view.getByRole("switch", { name: "IT" }).getAttribute("aria-checked"),
    "true",
  );
});
