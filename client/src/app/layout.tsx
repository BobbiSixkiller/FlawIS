import "./globals.css";
import localFont from "next/font/local";
import { dir } from "i18next";
import { cookies, headers } from "next/headers";
import { ReactNode } from "react";
import {
  cookieName,
  fallbackLng,
  getSupportedLocale,
  localeHeaderName,
} from "@/lib/i18n/settings";
import ThemeProvider from "@/components/ThemeProvider";
import {
  getThemePreference,
  systemThemeScript,
  themeCookieName,
} from "@/lib/theme";

const UKsans = localFont({
  src: [
    {
      path: "../../public/UKsans/UKSans-Thin.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/UKsans/UKSans-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/UKsans/UKSans-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/UKsans/UKSans-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/UKsans/UKSans-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/UKsans/UKSans-Heavy.otf",
      weight: "900",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-UKsans",
});

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const lng =
    getSupportedLocale(headerStore.get(localeHeaderName)) ??
    getSupportedLocale(cookieStore.get(cookieName)?.value) ??
    fallbackLng;
  const theme = getThemePreference(cookieStore.get(themeCookieName)?.value);

  return (
    <html
      lang={lng}
      dir={dir(lng)}
      className={theme === "dark" ? "dark" : ""}
      suppressHydrationWarning
    >
      {theme === "system" ? (
        <head>
          <script dangerouslySetInnerHTML={{ __html: systemThemeScript }} />
        </head>
      ) : null}
      <body className={UKsans.className}>
        <ThemeProvider initialPreference={theme}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
