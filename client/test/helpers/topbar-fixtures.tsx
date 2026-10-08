import Link from "next/link";
import { Profiler, ProfilerOnRenderCallback, ReactNode } from "react";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import {
  PathnameContext,
  PathParamsContext,
} from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import en from "../../src/lib/i18n/locales/en/dashboard.json";
import sk from "../../src/lib/i18n/locales/sk/dashboard.json";
import TopBar from "../../src/components/TopBar";
import AccountMenu from "../../src/components/AccountMenu";
import { BreadcrumbLabel } from "../../src/components/BreadcrumbLabels";

const i18n = createInstance();
const ignoreRender: ProfilerOnRenderCallback = () => {};
void i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  defaultNS: "dashboard",
  resources: { en: { dashboard: en }, sk: { dashboard: sk } },
  initImmediate: false,
});

export function TestTopBar({
  path = "/en/flawis/internships/example/update",
  lng = "en",
  drawer = false,
  avatar,
  params = {},
  labels = [],
  onRender = ignoreRender,
}: {
  path?: string;
  lng?: string;
  drawer?: boolean;
  avatar?: ReactNode;
  params?: Record<string, string>;
  labels?: { param: string; value: string; path: string; label: string }[];
  onRender?: ProfilerOnRenderCallback;
}) {
  return (
    <I18nextProvider i18n={i18n}>
      <PathParamsContext.Provider value={{ ...params, lng }}>
        <PathnameContext.Provider value={path}>
          {labels.map((label, index) => (
            <BreadcrumbLabel key={index} {...label} />
          ))}
          <Profiler id="topbar" onRender={onRender}>
            <TopBar
              logo={<span>Logo</span>}
              drawer={
                drawer
                  ? {
                      title: "Navigation",
                      content: <Link href="/flawis">Dashboard</Link>,
                    }
                  : undefined
              }
              actions={
                <AccountMenu
                  avatar={avatar}
                  signInHref="/login?returnTo=internships"
                />
              }
            />
          </Profiler>
        </PathnameContext.Provider>
      </PathParamsContext.Provider>
    </I18nextProvider>
  );
}
