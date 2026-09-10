import "server-only";

import { headers } from "next/headers";

export function currentTimestamp() {
  return Date.now();
}

export async function getSubdomain() {
  const headerStore = await headers();
  const host = headerStore.get("host") || "localhost:3000"; // Get the hostname from the request
  const subdomain = host.split(".")[0].replace("-staging", ""); // Parse the subdomain (assuming subdomain is the first part)

  return subdomain;
}
