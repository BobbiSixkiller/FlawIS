import SearchAttendee from "../SearchAttendee";

export default async function Sidebar({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  await params;

  return <SearchAttendee />;
}

export const dynamic = "force-dynamic";
