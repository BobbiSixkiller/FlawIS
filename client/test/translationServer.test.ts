import assert from "node:assert/strict";
import { before, beforeEach, test } from "node:test";
import { PassThrough } from "node:stream";
import { createElement, use, type ReactNode } from "react";
import { renderToPipeableStream, renderToStaticMarkup } from "react-dom/server";
import i18next from "i18next";
import { useTranslation } from "../src/hooks/use-translation";

before(async () => {
  if (!i18next.isInitialized) {
    await new Promise<void>((resolve) => {
      const initialized = () => {
        i18next.off("initialized", initialized);
        resolve();
      };
      i18next.on("initialized", initialized);
    });
  }
  await i18next.loadNamespaces(["login", "dashboard", "validation"]);
});

beforeEach(async () => {
  await i18next.changeLanguage("sk");
});

function Translated({ lng }: { lng: string }) {
  const { t } = useTranslation(lng, ["login", "validation"]);
  const { t: theme } = useTranslation(lng, "dashboard", { keyPrefix: "theme" });
  return createElement(
    "p",
    null,
    `${t("password")} | ${t("validation:required")} | ${theme("light")}`,
  );
}

const expected = {
  en: "<p>Password | This is a required field! | Light</p>",
  sk: "<p>Heslo | Povinné pole! | Svetlý</p>",
};

test("server translations use the requested locale without changing shared language", () => {
  for (const lng of ["en", "sk", "en", "sk"] as const) {
    assert.equal(
      renderToStaticMarkup(createElement(Translated, { lng })),
      expected[lng],
    );
    assert.equal(i18next.language, "sk");
  }
});

function Deferred({
  gate,
  started,
  children,
}: {
  gate: Promise<void>;
  started: () => void;
  children?: ReactNode;
}) {
  started();
  use(gate);
  return children;
}

function streamHtml(element: ReactNode) {
  return new Promise<string>((resolve, reject) => {
    const destination = new PassThrough();
    let html = "";
    destination.on("data", (chunk) => {
      html += chunk.toString();
    });
    destination.on("end", () => resolve(html));
    destination.on("error", reject);
    const stream = renderToPipeableStream(element, {
      onAllReady() {
        stream.pipe(destination);
      },
      onError: reject,
    });
  });
}

test("concurrent server renders keep their locale when another request resumes first", async () => {
  const requests = (["en", "sk", "en", "sk"] as const).map((lng) => {
    const gate = Promise.withResolvers<void>();
    const started = Promise.withResolvers<void>();
    const html = streamHtml(
      createElement(
        "section",
        null,
        createElement(Translated, { lng }),
        createElement(
          Deferred,
          { gate: gate.promise, started: started.resolve },
          createElement(Translated, { lng }),
        ),
      ),
    );
    return { lng, gate, started, html };
  });

  await Promise.all(requests.map(({ started }) => started.promise));
  try {
    for (const request of requests.toReversed()) {
      request.gate.resolve();
      assert.equal(
        await request.html,
        `<section>${expected[request.lng].repeat(2)}</section>`,
      );
    }
    assert.equal(i18next.language, "sk");
  } finally {
    requests.forEach(({ gate }) => gate.resolve());
    await Promise.allSettled(requests.map(({ html }) => html));
  }
});
