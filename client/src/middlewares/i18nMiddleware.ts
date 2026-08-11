import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import acceptLanguage from "accept-language";
import {
  cookieName,
  fallbackLng,
  getLocaleCookieDomain,
  getPathLocale,
  languages,
  localeHeaderName,
  stripPathLocale,
} from "../lib/i18n/settings";
import { CustomMiddleware } from "./chainMiddleware";

acceptLanguage.languages(languages);

function requestHeadersWithLocale(req: NextRequest, lng: string) {
  const headers = new Headers(req.headers);
  headers.set(localeHeaderName, lng);
  return headers;
}

function nextWithLocale(req: NextRequest, lng: string) {
  return NextResponse.next({
    request: { headers: requestHeadersWithLocale(req, lng) },
  });
}

function rewriteWithLocale(req: NextRequest, url: URL, lng: string) {
  return NextResponse.rewrite(url, {
    request: { headers: requestHeadersWithLocale(req, lng) },
  });
}

function setInitialLocaleCookie(
  response: NextResponse,
  req: NextRequest,
  lng: string,
) {
  response.cookies.set(cookieName, lng, {
    domain: getLocaleCookieDomain(req.nextUrl.hostname),
    path: "/",
    sameSite: "lax",
    secure: req.nextUrl.protocol === "https:",
  });

  return response;
}

export function withLocalization(middleware: CustomMiddleware) {
  return (
    req: NextRequest,
    event: NextFetchEvent,
    res?: NextResponse
  ) => {
    const url = req.nextUrl.clone();
    const cookieValue = req.cookies.get(cookieName)?.value;
    const cookieLng = cookieValue ? acceptLanguage.get(cookieValue) : null;
    const currentLng =
      cookieLng ??
      acceptLanguage.get(req.headers.get("Accept-Language")) ??
      fallbackLng;

    const paths = url.pathname.split("/");
    const pathLng = getPathLocale(url.pathname);

    const withInitialLocale = (response: NextResponse, lng: string) =>
      cookieLng ? response : setInitialLocaleCookie(response, req, lng);

    // Rewrite for default lng if no lng is in path
    if (!pathLng) {
      // Remove lng from path if it is not supported and redirect with currentLng
      if (paths[1].length === 2) {
        url.pathname = `/${currentLng}${url.pathname.slice(3)}`;

        return withInitialLocale(NextResponse.redirect(url), currentLng);
        // Redirect if currentLng si supported but is missing in path
      } else if (currentLng !== fallbackLng) {
        url.pathname = `/${currentLng}${url.pathname}`;

        return withInitialLocale(NextResponse.redirect(url), currentLng);
        // Rewrite when currentLng is fallbackLng
      } else {
        url.pathname = `/${currentLng}${url.pathname}`;

        return middleware(
          req,
          event,
          withInitialLocale(rewriteWithLocale(req, url, currentLng), currentLng),
        );
      }
    }

    // Remove default locale from path
    if (pathLng === fallbackLng) {
      // Preserve an explicitly requested locale when it differs from the saved
      // preference. The switcher saves the preference before navigating, so its
      // requests still receive the canonical locale-free URL.
      if (cookieLng && cookieLng !== fallbackLng) {
        return middleware(req, event, nextWithLocale(req, fallbackLng));
      }

      url.pathname = stripPathLocale(url.pathname);

      return withInitialLocale(NextResponse.redirect(url), fallbackLng);
    }

    return middleware(
      req,
      event,
      withInitialLocale(nextWithLocale(req, pathLng), pathLng),
    );
  };
}
