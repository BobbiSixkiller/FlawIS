import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { CustomMiddleware } from "./chainMiddleware";

const publicPaths = [
  "/login",
  "/register",
  "/forgotPassword",
  "/resetPassword",
  "/google/callback",
];

export function withAuth(middleware: CustomMiddleware) {
  return async (req: NextRequest, event: NextFetchEvent, res: NextResponse) => {
    const url = req.nextUrl.clone();
    const token = req.cookies.get("accessToken")?.value;

    if (!token && !publicPaths.some((path) => path === url.pathname)) {
      if (url.pathname !== "/" && url.pathname !== "/logout") {
        const fullUrl = `${url.pathname}${url.search}`;
        url.searchParams.keys().forEach((key) => url.searchParams.delete(key));
        url.searchParams.append("url", fullUrl);
      }
      url.pathname = "/login";

      return NextResponse.redirect(url);
    }

    if (token && publicPaths.some((path) => path === url.pathname)) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    return middleware(req, event, res);
  };
}
