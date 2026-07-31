const DEFAULT_UPSTREAM_TIMEOUT_MS = 30_000;

const FORWARDED_REQUEST_HEADERS = [
  "content-type",
  "x-hook-signature",
  "api-version",
] as const;

export interface ReachWebhookProxyOptions {
  upstreamUrl?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export async function proxyReachWebhook(
  request: Request,
  options: ReachWebhookProxyOptions = {},
) {
  const upstreamUrl = (
    options.upstreamUrl ??
    process.env.REACH_WEBHOOK_UPSTREAM_URL ??
    ""
  ).trim();

  if (!upstreamUrl) {
    return Response.json(
      { error: "reach_webhook_proxy_not_configured" },
      { status: 503 },
    );
  }

  const headers = new Headers();
  for (const headerName of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(headerName);
    if (value !== null) {
      headers.set(headerName, value);
    }
  }

  const body = await request.arrayBuffer();
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_UPSTREAM_TIMEOUT_MS;

  try {
    const upstreamResponse = await fetchImpl(upstreamUrl, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
    });
    const responseBody = await upstreamResponse.arrayBuffer();
    const responseHeaders = new Headers({ "Cache-Control": "no-store" });
    const contentType = upstreamResponse.headers.get("content-type");

    if (contentType !== null) {
      responseHeaders.set("Content-Type", contentType);
    }

    return new Response(responseBody, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch {
    console.error("Reach webhook proxy could not reach its configured upstream");
    return Response.json(
      { error: "reach_webhook_upstream_unavailable" },
      {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
