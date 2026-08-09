import assert from "node:assert/strict";
import test from "node:test";

import { translate } from "../src/lib/i18n";

test("Slovak internship application count uses every integer plural form", async () => {
  const { t } = await translate("sk", "internships");

  assert.equal(t("applied", { count: 0 }), "Prihlásených (0)");
  assert.equal(t("applied", { count: 1 }), "Prihlásený (1)");
  assert.equal(t("applied", { count: 2 }), "Prihlásení (2)");
  assert.equal(t("applied", { count: 3 }), "Prihlásení (3)");
  assert.equal(t("applied", { count: 4 }), "Prihlásení (4)");
  assert.equal(t("applied", { count: 5 }), "Prihlásených (5)");
});

test("English internship application count remains unchanged", async () => {
  const { t } = await translate("en", "internships");

  assert.equal(t("applied", { count: 0 }), "Applied (0)");
  assert.equal(t("applied", { count: 1 }), "Applied (1)");
  assert.equal(t("applied", { count: 2 }), "Applied (2)");
  assert.equal(t("applied", { count: 5 }), "Applied (5)");
});
