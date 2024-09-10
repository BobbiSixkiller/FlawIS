import SearchAttendee from "../SearchAttendee";

export default async function Sidebar({
  params: { lng },
}: {
  params: { lng: string };
}) {
  return <SearchAttendee />;
}
