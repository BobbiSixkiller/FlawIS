import assert from "node:assert/strict";
import test from "node:test";

import {
  getThemeCookieValue,
  getThemePreference,
  themePreferenceUsesDark,
} from "../src/lib/theme";

test("missing and invalid theme cookies use the system preference", () => {
  assert.equal(getThemePreference(undefined), "system");
  assert.equal(getThemePreference(null), "system");
  assert.equal(getThemePreference("sepia"), "system");
});

test("explicit light and dark preferences are preserved", () => {
  assert.equal(getThemePreference("light"), "light");
  assert.equal(getThemePreference("dark"), "dark");
  assert.equal(getThemePreference("system"), "system");
});

test("system mode deletes the cookie while explicit themes are stored", () => {
  assert.equal(getThemeCookieValue("system"), undefined);
  assert.equal(getThemeCookieValue("light"), "light");
  assert.equal(getThemeCookieValue("dark"), "dark");
});

test("only system mode follows the browser color scheme", () => {
  assert.equal(themePreferenceUsesDark("system", true), true);
  assert.equal(themePreferenceUsesDark("system", false), false);
  assert.equal(themePreferenceUsesDark("dark", false), true);
  assert.equal(themePreferenceUsesDark("light", true), false);
});
