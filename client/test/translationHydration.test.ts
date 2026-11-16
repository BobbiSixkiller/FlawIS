import "./helpers/dom";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { cleanup, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createInstance, type i18n } from "i18next";
import { I18nextProvider } from "react-i18next";
import { PathParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import LoginForm from "../src/app/[lng]/(auth)/login/login-form";
import ThemeToggler from "../src/components/theme-toggler";
import { ThemeContext } from "../src/hooks/use-theme-preference";
import loginEn from "../src/lib/i18n/locales/en/login.json";
import loginSk from "../src/lib/i18n/locales/sk/login.json";
import dashboardEn from "../src/lib/i18n/locales/en/dashboard.json";
import dashboardSk from "../src/lib/i18n/locales/sk/dashboard.json";
import validationEn from "../src/lib/i18n/locales/en/validation.json";
import validationSk from "../src/lib/i18n/locales/sk/validation.json";

afterEach(cleanup);

async function translations(lng: string) {
  const instance = createInstance();
  await instance.init({
    lng,
    fallbackLng: "sk",
    resources: {
      en: { login: loginEn, dashboard: dashboardEn, validation: validationEn },
      sk: { login: loginSk, dashboard: dashboardSk, validation: validationSk },
    },
  });
  return instance;
}

function fixture(instance: i18n, lng: string) {
  return createElement(I18nextProvider, { i18n: instance },
    createElement(PathParamsContext.Provider, { value: { lng } },
      createElement(ThemeContext.Provider, {
        value: { preference: "light", pending: false, setPreference() {} },
      },
      createElement(ThemeToggler, { lng }),
      createElement(LoginForm, { lng })),
    ),
  );
}

const labels = {
  en: { password: "Password", submit: "Sign in", theme: "Theme: Light", required: "This is a required field!" },
  sk: { password: "Heslo", submit: "Prihlásiť", theme: "Motív: Svetlý", required: "Povinné pole!" },
};

for (const lng of ["en", "sk"] as const) {
  test(`auth hydrates in ${lng} when the browser instance starts in another language`, async (context) => {
    const instance = await translations(lng);
    const container = document.createElement("div");
    document.body.append(container);
    container.innerHTML = renderToString(fixture(instance, lng));
    const password = container.querySelector('input[type="password"]');
    const originalText = container.textContent;

    await instance.changeLanguage(lng === "en" ? "sk" : "en");
    const errors: unknown[] = [];
    context.mock.method(console, "error", (...args: unknown[]) => { errors.push(args); });
    const view = render(fixture(instance, lng), {
      container,
      hydrate: true,
      onRecoverableError: (error) => { errors.push(error); },
    });

    await waitFor(() => assert.equal(instance.resolvedLanguage, lng));
    assert.deepEqual(errors, []);
    assert.equal(container.textContent, originalText);
    assert.equal(view.getByLabelText(labels[lng].password), password);
    assert.ok(view.getByRole("button", { name: labels[lng].theme }));
    assert.equal(document.documentElement.lang, lng);
    assert.equal(document.documentElement.dir, "ltr");

    await userEvent.setup().click(view.getByRole("button", { name: labels[lng].submit }));
    assert.ok(await view.findByText(labels[lng].required));
    assert.equal(container.querySelector('[aria-invalid="true"]'), document.activeElement);
  });
}

test("route language changes update auth labels and validation without remounting fields", async () => {
  const instance = await translations("en");
  const view = render(fixture(instance, "en"));
  const email = view.getByRole("textbox", { name: "Email" });
  const password = view.getByLabelText("Password");
  const user = userEvent.setup();
  await user.type(email, "draft@example.com");

  for (const lng of ["sk", "en"] as const) {
    view.rerender(fixture(instance, lng));
    assert.equal(view.getByLabelText(labels[lng].password), password);
    assert.equal((email as HTMLInputElement).value, "draft@example.com");
    assert.ok(view.getByRole("button", { name: labels[lng].theme }));
    await user.click(view.getByRole("button", { name: labels[lng].submit }));
    assert.ok(await view.findByText(labels[lng].required));
    assert.equal(document.documentElement.lang, lng);
  }
});
