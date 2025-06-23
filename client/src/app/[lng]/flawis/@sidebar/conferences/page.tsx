import SearchConference from "./SearchConference";

export default async function Sidebar({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  await params;

  return <SearchConference />;
}
