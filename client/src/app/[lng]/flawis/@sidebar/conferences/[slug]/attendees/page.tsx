import { languages } from "@/lib/i18n/settings";
import SearchAttendee from "./SearchAttendee";

export function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export default async function Sidebar({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  await params;

  return <SearchAttendee />;
}
