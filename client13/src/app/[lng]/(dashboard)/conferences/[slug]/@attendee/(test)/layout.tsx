import Link from "next/link";
import { ReactNode } from "react";

export default function Layout({
  children,
  params: { slug },
}: {
  children: ReactNode;
  params: { lng: string; slug: string };
}) {
  return (
    <>
      <nav className="flex gap-2">
        <Link href={`/conferences/${slug}`}>Info</Link>
        <Link href={`/conferences/${slug}/submissions`}>Submissions</Link>
      </nav>
      <div>{children}</div>
    </>
  );
}
