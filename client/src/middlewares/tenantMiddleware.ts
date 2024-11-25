import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { CustomMiddleware } from "./chainMiddleware";
import { fallbackLng } from "@/lib/i18n/settings";

//paths that are shared by all tenants
const commonPaths = [
  "/logout",
  "/login",
  "/register",
  "/forgotPassword",
  "/resetPassword",
  "/activate",
  "/minio",
  "/google/callback",
];

export function withTenant(middleware: CustomMiddleware) {
  return async (req: NextRequest, event: NextFetchEvent, res: NextResponse) => {
    const url = req.nextUrl.clone();

    const hostname = req.headers.get("host") || ""; // Get the hostname from the request
    const subdomain = hostname.split(".")[0]; // Parse the subdomain (assuming subdomain is the first part)

    let lng: string | undefined;
    const paths = url.pathname.split("/").filter((path) => path);
    if (paths[0]?.length === 2) {
      lng = paths.shift();
    } else lng = fallbackLng;

    if (commonPaths.some((path) => url.pathname === path)) {
      return middleware(req, event, res);
    }

    // Rewrite the response to include the subdomain in the path
    if (
      subdomain === "localhost:3000" ||
      subdomain === "internships" ||
      subdomain === "internships-staging"
    ) {
      const newUrl = new URL(
        `/${lng}/flawis/${paths.join("/")}${url.search}`,
        req.url
      ); // Rewrite the path with the subdomain

      return NextResponse.rewrite(newUrl, {
        headers: res?.headers,
      });
    }

    if (subdomain === "flawis" || subdomain === "flawis-staging") {
      const newUrl = new URL(
        `/${lng}/flawis/${paths.join("/")}${url.search}`,
        req.url
      );

      return NextResponse.rewrite(newUrl, {
        headers: res?.headers,
      });
    }

    if (subdomain === "conferences" || "conferences-staging") {
      const newUrl = new URL(
        `/${lng}/conferences/${paths.join("/")}${url.search}`,
        req.url
      );

      return NextResponse.rewrite(newUrl, {
        headers: res?.headers,
      });
    }

    // Execute remaining middleware
    return middleware(req, event, res);
  };
}
