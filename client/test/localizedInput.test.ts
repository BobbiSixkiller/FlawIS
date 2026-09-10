// Initialize the DOM before React performs browser capability detection.
import "./helpers/dom";
import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LocalizedTestForm as TestForm } from "./helpers/localized-form";

test("a translated-field error reveals the localized input and its message", () => {
  const html = renderToStaticMarkup(
    createElement(TestForm, {
      errors: {
        submission: {
          translations: {
            en: {
              name: {
                type: "server",
                message: "An English submission with this title already exists",
              },
            },
          },
        },
      },
    }),
  );

  assert.equal(html.match(/<textarea/g)?.length, 2);
  assert.match(html, /An English submission with this title already exists/);
});

test("the localized input stays collapsed when neither translation has an error", () => {
  const html = renderToStaticMarkup(createElement(TestForm));

  assert.equal(html.match(/<textarea/g)?.length, 1);
});
