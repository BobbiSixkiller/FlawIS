import { languages } from "@/lib/i18n/settings";
import SearchConference from "./SearchConference";

export function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export default async function Sidebar({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  await params;

  return <SearchConference />;
}
