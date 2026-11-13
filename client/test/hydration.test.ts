import "./helpers/dom";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { cleanup, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { PathParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import commonEn from "../src/lib/i18n/locales/en/common.json";
import commonSk from "../src/lib/i18n/locales/sk/common.json";
import SearchComponent from "../src/components/search";
import ReviewerDirectory from "../src/app/[lng]/flawis/reviewers/_components/reviewer-directory";

afterEach(cleanup);

async function environment(lng: string) {
  const i18n = createInstance();
  await i18n.init({
    lng,
    resources: { en: { common: commonEn }, sk: { common: commonSk } },
    defaultNS: "common",
    interpolation: { escapeValue: false },
  });
  return function Environment({ children }: { children?: React.ReactNode }) {
    return createElement(
      PathParamsContext.Provider,
      { value: { lng } },
      createElement(I18nextProvider, { i18n }, children),
    );
  };
}

test("header search stays disabled in server markup and opens on its first hydrated click", async () => {
  const Environment = await environment("en");
  const fixture = createElement(
    Environment,
    null,
    createElement(SearchComponent, {
      placeholder: "Find reviewers",
      fetchOptions: async () => [],
      Option: () => null,
      onOptionSelect: () => {},
    }),
  );
  const container = document.createElement("div");
  document.body.append(container);
  container.innerHTML = renderToString(fixture);
  assert.equal(container.querySelector("button")!.disabled, true);

  const view = render(fixture, {
    container,
    baseElement: document.body,
    hydrate: true,
  });
  const trigger = view.getByRole("button", { name: "Find reviewers" });
  assert.equal((trigger as HTMLButtonElement).disabled, false);
  await userEvent.setup().click(trigger);
  assert.ok(view.getByRole("dialog"));
  await waitFor(() =>
    assert.ok(
      document.activeElement ===
        view.getByRole("combobox", { name: "Find reviewers" }),
    ),
  );
});

for (const lng of ["en", "sk"]) {
  test(`reviewer toolbar stays disabled until hydration and the first Add click opens the form (${lng})`, async () => {
    const Environment = await environment(lng);
    const fixture = createElement(
      Environment,
      null,
      createElement(ReviewerDirectory, {
        initial: {
          rows: [],
          totalCount: 0,
          hasNextPage: false,
          endCursor: null,
        },
        search: "",
        canManage: true,
        lng,
      }),
    );
    const container = document.createElement("div");
    document.body.append(container);
    container.innerHTML = renderToString(fixture);
    const buttons = [...container.querySelectorAll("button")];
    assert.equal(buttons.length, 3);
    assert.ok(buttons.every((button) => button.disabled));

    const view = render(fixture, {
      container,
      baseElement: document.body,
      hydrate: true,
    });
    const add = view.getByRole("button", {
      name: lng === "en" ? "Add reviewer" : "Pridať recenzenta",
    });
    assert.equal((add as HTMLButtonElement).disabled, false);
    await userEvent.setup().click(add);
    assert.ok(view.getByRole("dialog"));
    await waitFor(() =>
      assert.ok(
        document.activeElement ===
          view.getByRole("textbox", {
            name: lng === "en" ? "Name and titles" : "Meno a tituly",
          }),
      ),
    );
  });
}
