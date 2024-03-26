import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { CustomMiddleware } from "./chainMiddleware";
import { cookies } from "next/headers";

export const protectedPaths = [
  "/profile",
  "/activate",
  "/users",
  "/conferences",
];

const publicPaths = [
  "/login",
  "/register",
  "/forgotPassword",
  "/resetPassword",
];

export function withAuth(middleware: CustomMiddleware) {
  return async (req: NextRequest, event: NextFetchEvent, res: NextResponse) => {
    const url = req.nextUrl.clone();
    const token = cookies().get("accessToken")?.value;

    if (!token && protectedPaths.some((path) => url.pathname.includes(path))) {
      url.searchParams.append("url", url.pathname);
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
