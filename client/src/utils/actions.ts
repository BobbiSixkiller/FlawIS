"use server";

import { TypedDocumentString } from "@/lib/graphql/generated/graphql";
import { GraphQLError } from "graphql";
import { IncomingHttpHeaders } from "http";
import { cookies, headers } from "next/headers";
import parseValidationErrors, { ValidationErrors } from "./parseErrors";
import { revalidatePath, revalidateTag } from "next/cache";

export async function setDarkThemeCookie(val: boolean) {
  const cookieStore = await cookies();
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

  if (val) {
    cookieStore.set("theme", "dark", {
      expires,
      sameSite: "lax",
      path: "/",
      domain:
        process.env.NODE_ENV === "development" ? "localhost" : ".flaw.uniba.sk",
    });
  } else {
    cookieStore.delete({
      name: "theme",
      sameSite: "lax",
      path: "/",
      domain:
        process.env.NODE_ENV === "development" ? "localhost" : ".flaw.uniba.sk",
    });
  }
}

export type GraphQLResponse<GraphQLData> = {
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
  const reqHeaders = await headers();
  const reqCookies = await cookies();

  const forwardedFor =
    reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip");
  // The forwardedFor string may contain multiple IPs in the format "client, proxy1, proxy2"
  const clientIp = forwardedFor?.split(",")[0]?.trim() || ""; // Take the first one which is the actual client IP
  const host = reqHeaders.get("host") || "localhost:3000";

  const res = await fetch(process.env.API_URI || "http://core:5000/graphql", {
    cache: nextCache,
    next,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": clientIp,
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

type MutationOptions<Data> = {
  revalidateTags?: (data: Data) => string[];
  revalidatePaths?: (data: Data) => string[];
};

type GqlMutationResponse<TransformedData> = {
  success: boolean;
  message: string;
  data?: TransformedData;
  errors?: Record<string, string>; // or whatever format you use
};

export async function executeGqlMutation<Data, Variables, TransformedData>(
  document: TypedDocumentString<Data, Variables>,
  variables: Variables,
  getResult: (data: Data) => { message: string; data?: TransformedData },
  options?: MutationOptions<Data>,
  customHeaders: IncomingHttpHeaders | null = null,
  next?: NextFetchRequestConfig,
  nextCache?: RequestCache
): Promise<GqlMutationResponse<TransformedData>> {
  const res = await executeGqlFetch(
    document,
    variables,
    customHeaders,
    next,
    nextCache
  );

  if (res.errors) {
    const { validationErrors } = res.errors[0].extensions;
    return {
      success: false,
      message: res.errors[0].message,
      errors: validationErrors
        ? parseValidationErrors(validationErrors as ValidationErrors[])
        : undefined,
    };
  }

  // Optional cache revalidation
  if (options?.revalidateTags) {
    for (const tag of options.revalidateTags(res.data)) {
      revalidateTag(tag);
    }
  }

  if (options?.revalidatePaths) {
    for (const path of options.revalidatePaths(res.data)) {
      revalidatePath(path);
    }
  }

  const { message, data } = getResult(res.data);

  return {
    success: true,
    message,
    data,
  };
}

export async function getSubdomain() {
  const headerStore = await headers();
  const host = headerStore.get("host") || "localhost:3000"; // Get the hostname from the request
  const subdomain = host.split(".")[0]; // Parse the subdomain (assuming subdomain is the first part)

  return subdomain;
}
