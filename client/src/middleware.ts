import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!_next|api|locales|images).)*"],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host");

  switch (hostname) {
    case "conferences.flaw.uniba.sk":
      url.pathname = `/conferences${url.pathname}`;
      return NextResponse.rewrite(url);

    case "grants.flaw.uniba.sk":
      url.pathname = `/grants${url.pathname}`;
      return NextResponse.rewrite(url);

    case "localhost:3000":
      url.pathname = `/conferences${url.pathname}`;
      return NextResponse.rewrite(url);

    default:
      url.pathname = "/404";
      return NextResponse.rewrite(url);
  }
}
