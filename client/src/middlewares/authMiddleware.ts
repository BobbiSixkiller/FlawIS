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
      const redirectTo = url.searchParams.get("url") || "/";
      url.pathname = redirectTo;
      return NextResponse.redirect(url);
    }

    return middleware(req, event, res);
  };
}
