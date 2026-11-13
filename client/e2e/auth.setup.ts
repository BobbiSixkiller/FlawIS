import { existsSync } from "node:fs";
import { test, expect } from "@playwright/test";
import { authFile, baseURL } from "./environment.mjs";

test.use({ storageState: existsSync(authFile) ? authFile : undefined });

test("saved staging session can access the reviewer directory", async ({ page }) => {
  expect(
    existsSync(authFile),
    "Run npm run test:browser:login in client/ to save a staging session first.",
  ).toBe(true);
  await page.goto(`${baseURL}/en/reviewers`);
  await expect(
    page.getByRole("heading", { name: "Reviewer directory", exact: true }),
    "Staging must have the review feature deployed and the saved account must have access. Refresh the saved login if it expired.",
  ).toBeVisible();
});
