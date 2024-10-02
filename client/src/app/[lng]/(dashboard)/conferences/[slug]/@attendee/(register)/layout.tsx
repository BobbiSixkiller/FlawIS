import { ReactNode } from "react";

export default function Layout({
  children,
  params: { slug },
}: {
  children: ReactNode;
  params: { lng: string; slug: string };
}) {
  return children;
}
