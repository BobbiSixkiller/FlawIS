import { expect, type Locator, type Page, type Route } from "@playwright/test";

/** Verify disabled server markup, then use the trigger's first enabled click. */
export async function openAfterHydration(
  page: Page,
  path: string,
  trigger: Locator,
) {
  let releaseScripts!: () => void;
  const scripts = new Promise<void>((resolve) => {
    releaseScripts = resolve;
  });
  const holdScripts = async (route: Route) => {
    if (route.request().resourceType() === "script") await scripts;
    await route.fallback();
  };
  await page.route("**/_next/static/**", holdScripts);
  try {
    // The load event waits for deferred scripts, which this check holds back.
    await page.goto(path, { waitUntil: "commit" });
    await expect(trigger).toBeVisible();
    await expect(trigger).toBeDisabled();
  } finally {
    releaseScripts();
    await page.unroute("**/_next/static/**", holdScripts);
  }
  await trigger.click();
}
