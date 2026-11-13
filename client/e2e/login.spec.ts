import { test, expect } from "@playwright/test";

for (const lng of ["en", "sk"]) {
  test(`staging login is available (${lng})`, async ({ page }) => {
    const response = await page.goto(`/${lng}/login`);
    expect(response?.ok()).toBe(true);
    await expect(page.getByRole("textbox", { name: "Email", exact: true })).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
}
