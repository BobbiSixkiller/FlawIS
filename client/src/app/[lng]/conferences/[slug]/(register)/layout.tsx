import { ReactNode } from "react";

export default function Layout({
  children,
}: {
  children: ReactNode;
  params: Promise<{ lng: string; slug: string }>;
}) {
  return children;
}
