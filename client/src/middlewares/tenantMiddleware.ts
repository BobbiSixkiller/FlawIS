import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { CustomMiddleware } from "./chainMiddleware";
import { cookies } from "next/headers";
import { cookieName } from "@/lib/i18n/settings";

export function withTenant(middleware: CustomMiddleware) {
  return async (req: NextRequest, event: NextFetchEvent, res: NextResponse) => {
    const url = req.nextUrl.clone();
    const hostname = req.headers.get("host") || ""; // Get the hostname from the request
    const subdomain = hostname.split(".")[0]; // Parse the subdomain (assuming subdomain is the first part)

    const locale = cookies().get(cookieName)?.value || "sk";

    // console.log(`/${locale?.value}/${"zebracik"}${url.pathname}`);

    // If the subdomain is "conferences", perform the rewrite
    if (
      subdomain === "localhost:3000" ||
      subdomain === "internships.flaw.uniba.sk"
    ) {
      const newUrl = new URL(`/${locale}/zebracik${url.pathname}`, req.url); // Rewrite the path with the subdomain
      return NextResponse.rewrite(newUrl); // Rewrite the response to include the subdomain in the path
    }

    // Execute remaining middleware
    return middleware(req, event, res);
  };
}
