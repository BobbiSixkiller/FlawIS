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
    const pathWithoutLocale = url.pathname
      .replace("/en", "")
      .replace("/sk", "");
    const token = req.cookies.get("accessToken")?.value;

    if (!token && !publicPaths.some((path) => path === pathWithoutLocale)) {
      const loginUrl = new URL("/login", url.origin);

      if (url.pathname !== "/" && url.pathname !== "/logout") {
        const originalUrl = `${url.pathname}${url.search}`;
        loginUrl.searchParams.set("url", originalUrl);
      }

      return NextResponse.redirect(loginUrl);
    }

    if (token && publicPaths.some((path) => path === pathWithoutLocale)) {
      let redirectTo;
      const referer = req.headers.get("referer");
      if (referer) {
        // Create a URL object from the referer to extract its path and search.
        const refererUrl = new URL(referer);
        redirectTo = `${refererUrl.pathname}${refererUrl.search}`;
      } else {
        redirectTo = "/";
      }

      console.log("TRIGGERED PUBLIC PATH ", redirectTo);

      return NextResponse.redirect(redirectTo);
    }

    return middleware(req, event, res);
  };
}
