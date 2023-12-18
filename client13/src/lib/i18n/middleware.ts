import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import acceptLanguage from "accept-language";
import { cookieName, fallbackLng, languages } from "./settings";
import { CustomMiddleware } from "@/utils/chainMiddleware";

acceptLanguage.languages(languages);

export function withLocalization(middleware: CustomMiddleware) {
  return (req: NextRequest, event: NextFetchEvent, res: NextResponse) => {
    const url = req.nextUrl.clone();

    if (
      url.pathname.indexOf("icon") > -1 ||
      url.pathname.indexOf("chrome") > -1
    )
      return NextResponse.next();
    let lng;
    if (req.cookies.has(cookieName))
      lng = acceptLanguage.get(req.cookies.get(cookieName)?.value);
    if (!lng) lng = acceptLanguage.get(req.headers.get("Accept-Language"));
    if (!lng) lng = fallbackLng;

    // Redirect if lng in path is not supported
    if (
      !languages.some((loc) => url.pathname.startsWith(`/${loc}`)) &&
      !url.pathname.startsWith("/_next")
    ) {
      url.pathname = `/${lng}${url.pathname}`;

      // Rewrite for default locale that is removed from URL
      if (lng === fallbackLng) {
        return NextResponse.rewrite(url);
      }
      return NextResponse.redirect(url);
    }

    if (req.headers.has("referer")) {
      const refererUrl = new URL(req.headers.get("referer") as string);
      const lngInReferer = languages.find((l) =>
        refererUrl.pathname.startsWith(`/${l}`)
      );
      const response = NextResponse.next();
      if (lngInReferer) {
        response.cookies.set(cookieName, lngInReferer);
      }
      return response;
    }

    return middleware(req, event, res);
  };
}
