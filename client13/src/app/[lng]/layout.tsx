import { useTranslation } from "@/lib/i18n";
import "../globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { dir } from "i18next";
import { languages } from "@/lib/i18n/settings";
import MessageProvider from "@/providers/MessageProvider";

const UKsans = localFont({
  src: [
    {
      path: "../../../public/UKsans/UKSans-Thin.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../../public/UKsans/UKSans-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../../public/UKsans/UKSans-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/UKsans/UKSans-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../public/UKsans/UKSans-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../../public/UKsans/UKSans-Heavy.otf",
      weight: "900",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-UKsans",
});

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export async function generateMetadata({
  params: { lng },
}: {
  params: { lng: string };
}): Promise<Metadata> {
  // eslint-disable-next-line no-console, react-hooks/rules-of-hooks
  const { t } = await useTranslation(lng, "landing");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function RootLayout({
  children,
  params: { lng },
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  return (
    <html lang={lng} dir={dir(lng)}>
      <body className={`${UKsans.className}`}>
        <MessageProvider>{children}</MessageProvider>
      </body>
    </html>
  );
}
