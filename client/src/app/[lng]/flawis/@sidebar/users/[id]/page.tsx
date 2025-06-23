import SearchUser from "../SearchUser";

export default async function Sidebar({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  await params;

  return <SearchUser />;
}

export const dynamic = "force-dynamic";
