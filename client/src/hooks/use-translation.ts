"use client";

import i18next from "i18next";
import { useEffect } from "react";
import {
  initReactI18next,
  useTranslation as useTranslationOrg,
  type UseTranslationOptions,
} from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { cookieName, getOptions, languages } from "../lib/i18n/settings";

const runsOnServerSide = typeof window === "undefined";

// Share translation resources, but never select a request's language on the server singleton.
i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`../lib/i18n/locales/${language}/${namespace}.json`),
    ),
  )
  .init({
    ...getOptions(),
    lng: undefined, // let detect the language on client side
    detection: {
      order: ["path", "htmlTag", "cookie", "navigator"],
      lookupCookie: cookieName,
      caches: [],
    },
    preload: runsOnServerSide ? languages : [],
  });

/** Bind SSR and initial hydration to the route locale; sync browser language after mount. */
export function useTranslation(
  lng: string,
  ns: string | string[],
  options?: Omit<UseTranslationOptions<string>, "lng">,
) {
  const ret = useTranslationOrg(ns, { ...options, lng });
  const { i18n } = ret;

  useEffect(() => {
    if (runsOnServerSide || !lng) return;

    document.documentElement.lang = lng;
    document.documentElement.dir = i18n.dir(lng);

    if (i18n.resolvedLanguage === lng) return;
    void i18n.changeLanguage(lng);
  }, [lng, i18n]);

  return ret;
}
