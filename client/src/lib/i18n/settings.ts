export const fallbackLng = "sk";
export const languages = [fallbackLng, "en"];
export const defaultNS = "translation";
export const cookieName = "NEXT_locale";
export const localeHeaderName = "x-flawis-locale";
export const localePreferenceMaxAge = 60 * 60 * 24 * 365;

export function getLocaleCookieDomain(hostname: string) {
  return hostname === "flaw.uniba.sk" || hostname.endsWith(".flaw.uniba.sk")
    ? ".flaw.uniba.sk"
    : undefined;
}

export function getPathLocale(pathname: string) {
  const firstSegment = pathname.split("/")[1];
  return languages.find((language) => language === firstSegment);
}

export function getSupportedLocale(value: string | null | undefined) {
  return languages.find((language) => language === value);
}

export function stripPathLocale(pathname: string) {
  const locale = getPathLocale(pathname);
  if (!locale) return pathname;

  return pathname.slice(locale.length + 1) || "/";
}

export function getLocalizedPath(pathname: string, lng: string) {
  const pathWithoutLocale = stripPathLocale(pathname);

  if (lng === fallbackLng) return pathWithoutLocale;
  return `/${lng}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;
}

export function getOptions(
  lng = fallbackLng,
  ns = [defaultNS] as string | string[]
) {
  return {
    // debug: true,
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
}
