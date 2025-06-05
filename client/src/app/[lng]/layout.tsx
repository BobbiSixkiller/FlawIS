import "../globals.css";
import localFont from "next/font/local";
import { dir } from "i18next";
import MessageProvider from "@/providers/MessageProvider";
import { AppMessage } from "@/components/Message";
import { cookies } from "next/headers";

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

export default async function RootLayout({
  children,
  params: { lng },
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  const theme = cookies().get("theme")?.value;

  return (
    <html lang={lng} dir={dir(lng)}>
      <body className={`${UKsans.className} ${theme === "dark" ? "dark" : ""}`}>
        <MessageProvider>
          {children}
          <AppMessage lng={lng} />
        </MessageProvider>
      </body>
    </html>
  );
}
