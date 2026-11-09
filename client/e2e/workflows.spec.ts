import { test, expect } from "@playwright/test";
import { conferenceSlug } from "./environment.mjs";

// Shared staging contains real snapshot records. These checks never submit a valid
// mutation, upload a file, send mail, archive a contact, or change a decision.
test("skip navigation stays compact and reviewer dialogs retain keyboard focus", async ({
  page,
}, info) => {
  const lng = info.project.metadata.language;
  const sk = lng === "sk";
  await page.goto(`/${lng}/reviewers`);
  const main = page.locator("#main-content");
  const skip = page.locator('a[href="#main-content"]');
  const add = page.getByRole("button", {
    name: sk ? "Pridať recenzenta" : "Add reviewer",
    exact: true,
  });
  const dialog = page.locator('[data-slot="dialog-content"]');
  await expect(add).toBeVisible();
  const before = await main.boundingBox();
  await skip.focus();
  await expect(skip).toBeInViewport();
  expect(await skip.evaluate((el) => getComputedStyle(el).position)).toBe(
    "fixed",
  );
  expect((await skip.boundingBox())!.height).toBeLessThan(65);
  expect(await main.boundingBox()).toEqual(before);
  await page.keyboard.press("Enter");
  await expect(main).toBeFocused();
  await expect(skip).not.toBeInViewport();
  await add.click();
  await expect(dialog).toBeVisible();
  await expect(page.locator("#review-name")).toBeFocused();
  for (let n = 0; n < 13; n++) {
    await page.keyboard.press("Tab");
    await expect
      .poll(() => dialog.evaluate((el) => el.contains(document.activeElement)))
      .toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(add).toBeFocused();
  await expect(skip).not.toBeInViewport();
});

test("invalid reviewer drafts stay local and discarding clears the next dialog", async ({
  page,
}, info) => {
  const lng = info.project.metadata.language;
  const sk = lng === "sk";
  await page.goto(`/${lng}/reviewers`);
  const add = page.getByRole("button", {
    name: sk ? "Pridať recenzenta" : "Add reviewer",
    exact: true,
  });
  const dialog = page.locator('[data-slot="dialog-content"]');
  await add.click();
  const name = dialog.getByLabel(sk ? "Meno a tituly" : "Name and titles", {
    exact: true,
  });
  const email = dialog.getByLabel("E-mail", { exact: true });
  const blockedWrites: string[] = [];
  await page.route("**/*", async (route) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(route.request().method())) {
      blockedWrites.push(route.request().method());
      await route.abort();
    } else await route.continue();
  });
  await name.fill("Unsubmitted browser test");
  await email.fill("invalid-email");
  await dialog
    .getByRole("button", {
      name: sk ? "Uložiť zmeny" : "Save changes",
      exact: true,
    })
    .click();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(name).toHaveValue("Unsubmitted browser test");
  await dialog
    .getByRole("button", { name: sk ? "Zrušiť" : "Cancel", exact: true })
    .click();
  const confirmation = page.getByRole("alertdialog");
  await expect(confirmation).toBeVisible();
  await confirmation
    .getByRole("button", {
      name: sk ? "Pokračovať v úpravách" : "Keep editing",
      exact: true,
    })
    .click();
  await expect(name).toHaveValue("Unsubmitted browser test");
  await dialog
    .getByRole("button", { name: sk ? "Zrušiť" : "Cancel", exact: true })
    .click();
  await confirmation
    .getByRole("button", {
      name: sk ? "Zahodiť zmeny" : "Discard changes",
      exact: true,
    })
    .click();
  await expect(dialog).toBeHidden();
  await add.click();
  await expect(name).toHaveValue("");
  await expect(email).toHaveValue("");
  expect(blockedWrites, "Invalid drafts must not make write requests to shared staging").toEqual([]);
  await page.keyboard.press("Escape");
});

test("reviewer and form search live in the header and support keyboard dismissal", async ({
  page,
}, info) => {
  const lng = info.project.metadata.language;
  const sk = lng === "sk";
  for (const [route, label] of [
    ["reviewers", sk ? "Hľadať recenzenta" : "Find a reviewer"],
    ["forms", sk ? "Hľadať formulár" : "Find a form"],
  ]) {
    await page.goto(`/${lng}/${route}`);
    const trigger = page
      .locator("header")
      .getByRole("button", { name: label, exact: true });
    await expect(trigger).toBeVisible();
    await expect(
      page
        .locator("#main-content")
        .getByRole("button", { name: label, exact: true }),
    ).toHaveCount(0);
    await trigger.click();
    const dialog = page.locator('[data-slot="dialog-content"]');
    await expect(dialog.getByRole("combobox")).toBeVisible();
    await expect(
      page.getByText(
        sk ? "Zobraziť zodpovedajúce výsledky" : "Show matching results",
        { exact: true },
      ),
    ).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await page.keyboard.press("Control+k");
    await expect(dialog).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.keyboard.press("Escape");
  }
});

test("submission header search clears on settings navigation", async ({
  page,
}, info) => {
  test.skip(
    !conferenceSlug,
    "Set E2E_CONFERENCE_SLUG to an existing review-enabled test conference for queue checks.",
  );
  const lng = info.project.metadata.language;
  const sk = lng === "sk";
  await page.goto(`/${lng}/conferences/${conferenceSlug}/reviews`);
  const search = page
    .locator("header")
    .getByRole("button", {
      name: sk ? "Hľadať príspevok" : "Find a submission",
      exact: true,
    });
  await expect(search).toBeVisible();
  await page
    .getByRole("link", {
      name: sk ? "Nastavenia recenzií" : "Review settings",
      exact: true,
    })
    .click();
  await expect(search).toHaveCount(0);
});
