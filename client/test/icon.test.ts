import assert from "node:assert/strict";
import test from "node:test";
import { createElement, createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import Icon, { type IconName, type IconProps } from "../src/components/Icon";

test("icons are decorative by default and forward SVG props", () => {
  const markup = renderToStaticMarkup(
    createElement(Icon, {
      name: "pencil",
      className: "size-5 text-primary-500",
      width: 20,
      height: 20,
      strokeWidth: 2,
      id: "edit-icon",
    }),
  );

  assert.match(markup, /^<svg\b/);
  assert.match(markup, /class="size-5 text-primary-500"/);
  assert.match(markup, /width="20"/);
  assert.match(markup, /height="20"/);
  assert.match(markup, /stroke-width="2"/);
  assert.match(markup, /id="edit-icon"/);
  assert.match(markup, /aria-hidden="true"/);
  assert.match(markup, /focusable="false"/);
  assert.doesNotMatch(markup, /role="img"/);
});

test("labelled icons remain available to assistive technology", () => {
  const markup = renderToStaticMarkup(
    createElement(Icon, {
      name: "home",
      "aria-label": "Home",
    }),
  );

  assert.match(markup, /aria-label="Home"/);
  assert.match(markup, /aria-hidden="false"/);
  assert.match(markup, /role="img"/);
});

test("the custom icons render through the same map", () => {
  const spinner = renderToStaticMarkup(createElement(Icon, { name: "spinner" }));
  const google = renderToStaticMarkup(createElement(Icon, { name: "google" }));
  const checkCircle = renderToStaticMarkup(
    createElement(Icon, { name: "check-circle" }),
  );

  assert.match(spinner, /viewBox="3 3 18 18"/);
  assert.match(spinner, /class="opacity-20"/);
  assert.match(google, /viewBox="0 0 48 48"/);
  assert.match(google, /fill="#FFC107"/);
  assert.match(checkCircle, /<circle/);
});

test("IconProps accepts SVG refs", () => {
  const ref = createRef<SVGSVGElement>();
  const props = {
    name: "check",
    ref,
  } satisfies IconProps;

  assert.equal(props.name, "check");
  assert.equal(Icon(props).props.ref, ref);
});

// @ts-expect-error unknown glyph names must fail type checking
const invalidIconName: IconName = "not-an-icon";
void invalidIconName;
