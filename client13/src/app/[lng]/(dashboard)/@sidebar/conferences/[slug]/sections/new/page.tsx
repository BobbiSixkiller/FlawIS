import SearchConference from "../../../SearchConference";

export default async function Sidebar({
  params: { lng },
}: {
  params: { lng: string };
}) {
  return <SearchConference />;
}
