import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeVariableSymbolPrefix,
  VARIABLE_SYMBOL_PREFIX_PATTERN,
} from "../src/lib/invoice/validation";

test("normalizes invoice prefixes to at most six digits", () => {
  assert.equal(normalizeVariableSymbolPrefix("20ab26/001"), "202600");
  assert.equal(normalizeVariableSymbolPrefix("000123"), "000123");
});

test("accepts only one to six numeric prefix digits", () => {
  assert.equal(VARIABLE_SYMBOL_PREFIX_PATTERN.test("2026"), true);
  assert.equal(VARIABLE_SYMBOL_PREFIX_PATTERN.test("invoice-2026"), false);
  assert.equal(VARIABLE_SYMBOL_PREFIX_PATTERN.test("1234567"), false);
  assert.equal(VARIABLE_SYMBOL_PREFIX_PATTERN.test(""), false);
});
