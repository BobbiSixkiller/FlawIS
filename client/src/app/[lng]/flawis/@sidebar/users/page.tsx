import { languages } from "@/lib/i18n/settings";
import SearchUser from "./SearchUser";

export function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export default async function Sidebar({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  await params;

  return <SearchUser />;
}

// export const dynamic = "force-dynamic";
