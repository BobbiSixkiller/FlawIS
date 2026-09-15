import { useMemo, useState } from "react";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import {
  AppRouterContext,
  type AppRouterInstance,
} from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  PathnameContext,
  SearchParamsContext,
} from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import UrlFilter, {
  type UrlFilterConfig,
} from "../../src/components/UrlFilter";
import en from "../../src/lib/i18n/locales/en/common.json";

const i18n = createInstance();
void i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  defaultNS: "common",
  initImmediate: false,
  resources: { en: { common: en } },
});

export function UrlFilterFixture({
  initialQuery = "",
  onNavigate,
  label = "Categories",
  query,
  filters = [
    {
      label: "Categories",
      queryKey: "category",
      type: "multi",
      options: [
        { value: "law", label: "Law", count: 3 },
        { value: "it", label: "IT", count: 1 },
      ],
    },
  ],
}: {
  initialQuery?: string;
  onNavigate: (href: string, scroll?: boolean) => void;
  filters?: UrlFilterConfig[];
  label?: string;
  query?: string;
}) {
  const [url, setUrl] = useState(`/en?${initialQuery}`);
  const searchParams = useMemo(
    () =>
      new URL(query === undefined ? url : `/en?${query}`, "http://localhost")
        .searchParams,
    [url, query],
  );
  const router = useMemo<AppRouterInstance>(
    () => ({
      back() {},
      forward() {},
      refresh() {},
      push() {},
      prefetch() {},
      replace(href, options) {
        onNavigate(href, options?.scroll);
        setUrl(href);
      },
    }),
    [onNavigate],
  );

  return (
    <I18nextProvider i18n={i18n}>
      <AppRouterContext.Provider value={router}>
        <PathnameContext.Provider value="/en">
          <SearchParamsContext.Provider value={searchParams}>
            <UrlFilter lng="en" filters={filters} label={label} />
          </SearchParamsContext.Provider>
        </PathnameContext.Provider>
      </AppRouterContext.Provider>
    </I18nextProvider>
  );
}
