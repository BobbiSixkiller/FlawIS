import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const route = path.join("/");
  if (
    !/^(files(?:\/[a-f\d]{24}|\/adopt\/[a-f\d]{24})?|exports\/(?:[a-f\d]{24}|bulk))$/i.test(
      route,
    )
  )
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const origin = (process.env.API_URI || "http://core:5000/graphql").replace(
    /\/graphql\/?$/,
    "",
  );
  const upstreamPath = route
    .replace(/^files/, "review-files")
    .replace(/^exports/, "review-exports");
  const url = new URL(`${origin}/${upstreamPath}`);
  request.nextUrl.searchParams.forEach((value, key) =>
    url.searchParams.set(key, value),
  );
  const headers = new Headers({
    Cookie: request.headers.get("cookie") || "",
    "tenant-domain": request.headers.get("host") || "localhost:3000",
  });
  for (const key of ["x-review-token", "x-revision-token"]) {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  }
  let body: ArrayBuffer | undefined;
  if (request.method === "POST" && route === "files") {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size > 20 * 1024 * 1024)
      return NextResponse.json(
        { error: "Choose a file up to 20 MiB." },
        { status: 400 },
      );
    headers.set("Content-Type", "application/octet-stream");
    headers.set("x-file-name", encodeURIComponent(file.name));
    body = await file.arrayBuffer();
  }
  const response = await fetch(url, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });
  const outgoing = new Headers({
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  });
  for (const key of ["content-type", "content-disposition"]) {
    const value = response.headers.get(key);
    if (value) outgoing.set(key, value);
  }
  return new NextResponse(response.body, {
    status: response.status,
    headers: outgoing,
  });
}
export const GET = proxy;
export const POST = proxy;
