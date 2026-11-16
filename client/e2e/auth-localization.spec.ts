import { expect, test, type Page } from "@playwright/test";

type Locale = "en" | "sk";
const routes = ["login", "register", "forgotPassword", "resetPassword"] as const;
type AuthRoute = (typeof routes)[number];
const labels = {
  en: {
    login: "Sign in to your account",
    register: "Create an account",
    forgotPassword: "Forgot password?",
    resetPassword: "Reset password",
    password: "Password",
    theme: "Theme",
    required: "This is a required field!",
  },
  sk: {
    login: "Prihláste sa do Vášho účtu",
    register: "Vytvoriť nový účet",
    forgotPassword: "Zabudli ste heslo?",
    resetPassword: "Reset hesla",
    password: "Heslo",
    theme: "Motív",
    required: "Povinné pole!",
  },
};

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

async function checkAuth(page: Page, lng: Locale, route: AuthRoute) {
  await expect(page.locator("main h1")).toHaveText(labels[lng][route]);
  await expect(page.locator("html")).toHaveAttribute("lang", lng);
  await expect(page.locator("header").getByRole("button", {
    name: new RegExp(`^${labels[lng].theme}:`),
  })).toBeVisible();
  if (route !== "forgotPassword") {
    await expect(page.getByLabel(labels[lng].password, { exact: true })).toBeVisible();
  }
  const language = page.locator("header").getByRole("button", {
    name: lng === "en" ? "English" : "Slovenčina",
    exact: true,
  });
  await language.click();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(language).toBeFocused();
}

for (const appearance of [
  { name: "desktop light", viewport: { width: 1440, height: 900 }, colorScheme: "light" },
  { name: "mobile dark", viewport: { width: 390, height: 844 }, colorScheme: "dark" },
] as const) {
  test.describe(appearance.name, () => {
    test.use({ viewport: appearance.viewport, colorScheme: appearance.colorScheme });

    for (const lng of ["en", "sk"] as const) {
      test(`auth translations hydrate and switch language (${lng})`, async ({ page, context, baseURL }) => {
        const errors = collectErrors(page);
        await context.addCookies([
          { name: "theme", value: appearance.colorScheme, url: baseURL! },
          // The route must win over a different saved browser preference.
          { name: "NEXT_locale", value: lng === "en" ? "sk" : "en", url: baseURL! },
        ]);
        for (const route of routes) {
          await page.goto(`/${lng}/${route}`);
          await checkAuth(page, lng, route);
        }

        await page.goto(`/${lng}/login`);
        for (const next of [lng === "en" ? "sk" : "en", lng] as const) {
          const current = next === "en" ? "sk" : "en";
          await page.locator("header").getByRole("button", {
            name: current === "en" ? "English" : "Slovenčina", exact: true,
          }).click();
          await page.getByRole("menuitem", {
            name: next === "en" ? "Angličtina" : "Slovak", exact: true,
          }).click();
          await checkAuth(page, next, "login");
          await page.locator('form button[type="submit"]').click();
          await expect(page.getByText(labels[next].required, { exact: true })).toBeVisible();
          await expect(page.locator('[aria-invalid="true"]').first()).toBeFocused();
        }
        expect(errors).toEqual([]);
      });
    }
  });
}

test("concurrent English and Slovak auth requests remain isolated", async ({ browser, baseURL }) => {
  const contexts = await Promise.all(Array.from({ length: 4 }, () => browser.newContext({ baseURL })));
  try {
    const sessions = await Promise.all(contexts.map(async (context, index) => {
      const page = await context.newPage();
      const errors = collectErrors(page);
      const lng: Locale = index % 2 === 0 ? "en" : "sk";
      return { page, errors, lng };
    }));
    for (const route of ["login", "register"] as const) {
      await Promise.all(sessions.map(({ page, lng }) => page.goto(`/${lng}/${route}`)));
      // Requests overlap; keyboard/popup checks each own browser focus.
      for (const { page, lng } of sessions) {
        await page.bringToFront();
        await checkAuth(page, lng, route);
      }
    }
    for (const { errors } of sessions) {
      expect(errors).toEqual([]);
    }
  } finally {
    await Promise.all(contexts.map((context) => context.close()));
  }
});
