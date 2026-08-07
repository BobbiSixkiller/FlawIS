import "reflect-metadata";

import assert from "node:assert/strict";
import test from "node:test";

import { TokenService } from "../src/services/token.service";
import { signJwt } from "../src/util/auth";

test("one-time tokens can be previewed without being consumed", async () => {
  let deleteCalls = 0;
  const tokenService = new TokenService(
    {
      get: async () => "valid",
      delete: async () => {
        deleteCalls += 1;
      },
    } as any,
    { translate: (key: string) => key } as any,
  );
  const token = signJwt({
    tokenId: "token-id",
    payload: { email: "author@example.com" },
  });

  const preview = await tokenService.inspectOneTimeToken<{
    email: string;
  }>(token);
  assert.equal(preview.payload?.email, "author@example.com");
  assert.equal(deleteCalls, 0);

  await tokenService.verifyOneTimeToken(token);
  assert.equal(deleteCalls, 1);
});
