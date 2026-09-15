import "./helpers/dom";
import { act, cleanup, render } from "@testing-library/react";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createElement } from "react";
import { ThemeProviderFixture } from "./helpers/theme-provider-fixture";

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove("dark");
});

test("system theme is restored after server cookie updates change the html class", (context) => {
  const originalMatchMedia = window.matchMedia;
  context.after(() => {
    window.matchMedia = originalMatchMedia;
  });
  let systemDark = true;
  const listeners = new Set<() => void>();
  window.matchMedia = (query) =>
    ({
      matches: systemDark,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener: (_event: string, listener: () => void) => {
        listeners.add(listener);
      },
      removeEventListener: (_event: string, listener: () => void) => {
        listeners.delete(listener);
      },
      dispatchEvent: () => true,
    }) as unknown as MediaQueryList;

  const view = render(
    createElement(ThemeProviderFixture, { initialPreference: "system" }),
  );
  assert.equal(document.documentElement.classList.contains("dark"), true);

  // A cookie response can arrive while the client's current preference is System.
  view.rerender(
    createElement(ThemeProviderFixture, { initialPreference: "dark" }),
  );
  document.documentElement.classList.remove("dark");
  view.rerender(
    createElement(ThemeProviderFixture, { initialPreference: "system" }),
  );
  assert.equal(document.documentElement.classList.contains("dark"), true);
  assert.equal(listeners.size, 1);

  act(() => {
    systemDark = false;
    listeners.forEach((listener) => listener());
  });
  assert.equal(document.documentElement.classList.contains("dark"), false);
  view.unmount();
  assert.equal(listeners.size, 0);
});
