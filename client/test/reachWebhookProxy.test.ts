import assert from "node:assert/strict";
import test from "node:test";
import { proxyReachWebhook } from "../src/lib/reachWebhookProxy";

const upstreamUrl = "http://core:5000/integrations/reach/webhooks";

function mockFetch(
  implementation: (
    input: string | URL | Request,
    init?: RequestInit,
  ) => Promise<Response>,
) {
  return implementation as typeof fetch;
}

async function suppressExpectedProxyError<T>(operation: () => Promise<T>) {
  const originalConsoleError = console.error;
  console.error = () => undefined;

  try {
    return await operation();
  } finally {
    console.error = originalConsoleError;
  }
}

test("forwards the exact body and only the permitted request headers", async () => {
  const payload = '{\n  "type": "user.created",  \n  "data": {}\n}\n';
  let forwardedBody: ArrayBuffer | undefined;
  let forwardedHeaders: Headers | undefined;
  let forwardedUrl: string | URL | Request | undefined;

  const response = await proxyReachWebhook(
    new Request("https://example.com/api/integrations/reach/webhooks", {
      method: "POST",
      headers: {
        "API-Version": "2023-05-04",
        Authorization: "Bearer must-not-be-forwarded",
        "Content-Type": "application/json",
        Cookie: "session=must-not-be-forwarded",
        "X-Hook-Signature": "signed-payload",
      },
      body: payload,
    }),
    {
      upstreamUrl,
      fetchImpl: mockFetch(async (input, init) => {
        forwardedUrl = input;
        forwardedHeaders = new Headers(init?.headers);
        forwardedBody = init?.body as ArrayBuffer;

        return new Response('{"received":true}', {
          status: 200,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }),
    },
  );

  assert.equal(forwardedUrl, upstreamUrl);
  assert.deepEqual(
    new Uint8Array(forwardedBody!),
    new TextEncoder().encode(payload),
  );
  assert.deepEqual(Object.fromEntries(forwardedHeaders!.entries()), {
    "api-version": "2023-05-04",
    "content-type": "application/json",
    "x-hook-signature": "signed-payload",
  });
  assert.equal(forwardedHeaders!.has("authorization"), false);
  assert.equal(forwardedHeaders!.has("cookie"), false);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "application/json; charset=utf-8");
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(await response.text(), '{"received":true}');
});

test("passes upstream statuses and response bodies through unchanged", async (t) => {
  for (const status of [200, 400, 401, 503]) {
    await t.test(String(status), async () => {
      const upstreamBody = `response-${status}`;
      const response = await proxyReachWebhook(
        new Request("https://example.com/api/integrations/reach/webhooks", {
          method: "POST",
          body: "{}",
        }),
        {
          upstreamUrl,
          fetchImpl: mockFetch(
            async () => new Response(upstreamBody, { status }),
          ),
        },
      );

      assert.equal(response.status, status);
      assert.equal(await response.text(), upstreamBody);
    });
  }
});

test("lets core reject a missing signature", async () => {
  let upstreamCalled = false;
  const response = await proxyReachWebhook(
    new Request("https://example.com/api/integrations/reach/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    }),
    {
      upstreamUrl,
      fetchImpl: mockFetch(async (_input, init) => {
        upstreamCalled = true;
        assert.equal(new Headers(init?.headers).has("x-hook-signature"), false);
        return Response.json({ error: "invalid_signature" }, { status: 401 });
      }),
    },
  );

  assert.equal(upstreamCalled, true);
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "invalid_signature" });
});

test("returns 503 when the upstream URL is not configured", async () => {
  const response = await proxyReachWebhook(
    new Request("https://example.com/api/integrations/reach/webhooks", {
      method: "POST",
      body: "{}",
    }),
    { upstreamUrl: "" },
  );

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    error: "reach_webhook_proxy_not_configured",
  });
});

test("returns 502 when the upstream request fails", async () => {
  const response = await suppressExpectedProxyError(() =>
    proxyReachWebhook(
      new Request("https://example.com/api/integrations/reach/webhooks", {
        method: "POST",
        body: "{}",
      }),
      {
        upstreamUrl,
        fetchImpl: mockFetch(async () => {
          throw new Error("upstream unavailable");
        }),
      },
    ),
  );

  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), {
    error: "reach_webhook_upstream_unavailable",
  });
});

test("returns 502 when the upstream request times out", async () => {
  const response = await suppressExpectedProxyError(() =>
    proxyReachWebhook(
      new Request("https://example.com/api/integrations/reach/webhooks", {
        method: "POST",
        body: "{}",
      }),
      {
        upstreamUrl,
        timeoutMs: 5,
        fetchImpl: mockFetch(
          async (_input, init) =>
            new Promise<Response>((_resolve, reject) => {
              const signal = init?.signal;
              assert.ok(signal);
              signal.addEventListener("abort", () => reject(signal.reason), {
                once: true,
              });
            }),
        ),
      },
    ),
  );

  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), {
    error: "reach_webhook_upstream_unavailable",
  });
});
