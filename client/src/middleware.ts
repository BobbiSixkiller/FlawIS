import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!api|_next|images|locales|[\\w-]+\\.\\w+).*)*"],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host");

  if (
    ["/login", "/forgotPassword", "/resetPassword", "/activate"].includes(
      url.pathname
    )
  ) {
    url.pathname = `/auth${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  switch (hostname) {
    case "conferences.flaw.uniba.sk":
      url.pathname = `/conferences${url.pathname}`;
      return NextResponse.rewrite(url);

    case "flawis.flaw.uniba.sk":
      url.pathname = `/flawis${url.pathname}`;
      return NextResponse.rewrite(url);

    case "localhost:3000":
      url.pathname = `/flawis${url.pathname}`;
      return NextResponse.rewrite(url);

    default:
      url.pathname = "/404";
      return NextResponse.rewrite(url);
  }
}
