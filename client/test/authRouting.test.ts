import assert from "node:assert/strict";
import test from "node:test";

import { googleOAuthHref } from "../src/lib/authRedirect";
import { isSubdomainPublicPath } from "../src/lib/authRoutes";

test("conference catalogue and detail pages are public while registration remains protected", () => {
  const host = "conferences.flaw.uniba.sk";

  assert.equal(isSubdomainPublicPath(host, "/"), true);
  assert.equal(isSubdomainPublicPath(host, "/milniky-prava"), true);
  assert.equal(
    isSubdomainPublicPath(host, "/milniky-prava/register"),
    false,
  );
});

test("Google sign-in preserves the complete nested coauthor invite URL", () => {
  const inviteUrl =
    "/en/milniky-prava/register?submission=submission-id&token=invite-token";
  const href = googleOAuthHref(inviteUrl);
  const oauthUrl = new URL(href, "https://conferences.flaw.uniba.sk");

  assert.equal(oauthUrl.searchParams.get("url"), inviteUrl);
  assert.equal(oauthUrl.searchParams.get("token"), null);
});
