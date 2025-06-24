import SearchAttendee from "../SearchAttendee";

export default async function Sidebar({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  return <SearchAttendee />;
}
