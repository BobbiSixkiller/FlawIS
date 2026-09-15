import Link from "next/link";
import { ReactNode } from "react";
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

const i18n = createInstance();
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
}: {
  path?: string;
  lng?: string;
  drawer?: boolean;
  avatar?: ReactNode;
}) {
  return (
    <I18nextProvider i18n={i18n}>
      <PathParamsContext.Provider value={{ lng }}>
        <PathnameContext.Provider value={path}>
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
        </PathnameContext.Provider>
      </PathParamsContext.Provider>
    </I18nextProvider>
  );
}
