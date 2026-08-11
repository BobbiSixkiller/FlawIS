import assert from "node:assert/strict";
import test from "node:test";

import { NextRequest, NextResponse } from "next/server";
import type { NextFetchEvent } from "next/server";

import {
  getLocalizedPath,
  getPathLocale,
  localeHeaderName,
  stripPathLocale,
} from "../src/lib/i18n/settings";
import { withLocalization } from "../src/middlewares/i18nMiddleware";

const localization = withLocalization((_request, _event, response) => {
  return response ?? NextResponse.next();
});

async function localize(
  pathname: string,
  {
    acceptLanguage = "en-US,en;q=0.9",
    cookie,
    prefetch = false,
  }: {
    acceptLanguage?: string;
    cookie?: string;
    prefetch?: boolean;
  } = {},
) {
  const headers = new Headers({ "accept-language": acceptLanguage });
  if (cookie) headers.set("cookie", cookie);
  if (prefetch) {
    headers.set("next-router-prefetch", "1");
    headers.set("purpose", "prefetch");
  }

  const response = await localization(
    new NextRequest(`http://localhost:3000${pathname}`, { headers }),
    {} as NextFetchEvent,
  );

  assert.ok(response);
  return response;
}

test("an existing locale preference overrides the browser language", async () => {
  const response = await localize("/login", {
    acceptLanguage: "sk-SK,sk;q=0.9",
    cookie: "NEXT_locale=en",
  });

  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "http://localhost:3000/en/login");
  assert.equal(response.headers.get("set-cookie"), null);
});

test("browser language initializes a session cookie when no preference exists", async () => {
  const response = await localize("/login");
  const cookie = response.headers.get("set-cookie");

  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "http://localhost:3000/en/login");
  assert.match(cookie ?? "", /^NEXT_locale=en;/);
  assert.doesNotMatch(cookie ?? "", /Max-Age|Expires|Domain/);
});

test("prefetching another locale does not overwrite an existing preference", async () => {
  const response = await localize("/en/login", {
    acceptLanguage: "sk-SK",
    cookie: "NEXT_locale=sk",
    prefetch: true,
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("set-cookie"), null);
  assert.equal(
    response.headers.get(`x-middleware-request-${localeHeaderName}`),
    "en",
  );
});

test("locale matching only recognizes complete path segments", async () => {
  const response = await localize("/skills", {
    acceptLanguage: "en-US",
    cookie: "NEXT_locale=sk",
  });

  assert.equal(response.status, 200);
  assert.equal(
    response.headers.get("x-middleware-rewrite"),
    "http://localhost:3000/sk/skills",
  );
  assert.equal(getPathLocale("/skills"), undefined);
  assert.equal(getPathLocale("/sk/skills"), "sk");
});

test("localized paths remove only a leading locale segment", () => {
  assert.equal(stripPathLocale("/en/login"), "/login");
  assert.equal(stripPathLocale("/skills"), "/skills");
  assert.equal(getLocalizedPath("/en/login", "sk"), "/login");
  assert.equal(getLocalizedPath("/login", "en"), "/en/login");
});
