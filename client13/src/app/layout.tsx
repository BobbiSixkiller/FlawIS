import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import DrawerProvider from "./providers/DrawerProvider";
import Nav from "@/components/Nav";

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

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${UKsans.className}`}>
        <DrawerProvider>
          <Nav>{children}</Nav>
        </DrawerProvider>
      </body>
    </html>
  );
}