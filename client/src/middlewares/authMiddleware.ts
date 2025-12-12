import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { CustomMiddleware } from "./chainMiddleware";

const authPaths = [
  "/login",
  "/register",
  "/forgotPassword",
  "/resetPassword",
  "/google/callback",
];

const objectIdRegex = /^\/[0-9a-fA-F]{24}$/;

type SubdomainType = "courses" | "flawis" | "conferences" | "internships";

function getSubdomainType(host: string): SubdomainType {
  const first = host.split(".")[0];

  if (first.includes("courses")) return "courses";
  if (first.includes("flawis")) return "flawis";
  if (first.includes("conferences")) return "conferences";
  if (first.includes("intern")) return "internships";

  // on localhost/dev this is returned
  return "courses";
}

const subdomainExtraPublic: Record<SubdomainType, (path: string) => boolean> = {
  flawis: () => false,
  conferences: () => false,
  internships: () => false,
  courses: (path) => path === "/" || objectIdRegex.test(path),
};

export function withAuth(middleware: CustomMiddleware) {
  return async (req: NextRequest, event: NextFetchEvent, res: NextResponse) => {
    const url = req.nextUrl.clone();
    const localeRegex = /^\/(en|sk)(?=\/|$)/;
    const pathWithoutLocale = url.pathname.replace(localeRegex, "") || "/";

    const token = req.cookies.get("accessToken")?.value;

    const host = req.headers.get("host") ?? url.host;
    const subdomainType = getSubdomainType(host);

    const isAuthPath = authPaths.includes(pathWithoutLocale);
    const isSubdomainPublic =
      subdomainExtraPublic[subdomainType](pathWithoutLocale);

    const isPublic = isAuthPath || isSubdomainPublic;

    // not logged in and on protected page redirect to login
    if (!token && !isPublic) {
      const loginUrl = new URL("/login", url.origin);

      if (url.pathname !== "/" && url.pathname !== "/logout") {
        const originalUrl = `${url.pathname}${url.search}`;
        loginUrl.searchParams.set("url", originalUrl);
      }

      return NextResponse.redirect(loginUrl);
    }

    // loggedin and on auth page redirect away
    if (token && isAuthPath) {
      let redirectTo = "/";
      const referer = req.headers.get("referer");

      if (referer) {
        const refererUrl = new URL(referer);
        const urlParam = refererUrl.searchParams.get("url");
        if (urlParam) {
          redirectTo = decodeURIComponent(urlParam);
        } else if (!authPaths.includes(pathWithoutLocale)) {
          redirectTo = `${refererUrl.pathname}${refererUrl.search}`;
        }
      }

      const finalUrl = new URL(redirectTo, url.origin);
      return NextResponse.redirect(finalUrl);
    }

    return middleware(req, event, res);
  };
}
