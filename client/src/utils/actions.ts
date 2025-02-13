"use server";

import { TypedDocumentString } from "@/lib/graphql/generated/graphql";
import { GraphQLError } from "graphql";
import { IncomingHttpHeaders } from "http";
import { cookies, headers } from "next/headers";

type GraphQLResponse<GraphQLData> = {
  data: GraphQLData;
  errors?: GraphQLError[];
};

export async function executeGqlFetch<Data, Variables>(
  document: TypedDocumentString<Data, Variables>,
  variables?: Variables,
  customHeaders: IncomingHttpHeaders | null = null,
  next?: NextFetchRequestConfig,
  nextCache?: RequestCache
): Promise<GraphQLResponse<Data>> {
  const reqHeaders = headers();
  const reqCookies = cookies();

  const forwardedFor =
    reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip");
  // The forwardedFor string may contain multiple IPs in the format "client, proxy1, proxy2"
  const clientIp = forwardedFor?.split(",")[0]?.trim(); // Take the first one which is the actual client IP
  const host = reqHeaders.get("host") || "client:3000";

  const res = await fetch(process.env.API_URI || "http://core:5000/graphql", {
    cache: nextCache,
    next,
    // cache: "no-store",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": clientIp || "",
      "tenant-domain": host,
      Cookie: reqCookies
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join(";"),
      ...(customHeaders as HeadersInit),
    },
    body: JSON.stringify({ query: document.toString(), variables }),
  });
  return (await res.json()) as GraphQLResponse<Data>;
}

export async function setDarkThemeCookie(val: boolean) {
  if (val) {
    cookies().set("theme", "dark");
  } else {
    cookies().delete("theme");
  }
}
