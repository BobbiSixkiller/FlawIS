import SearchUser from "./SearchUser";

export default async function Sidebar({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  return <SearchUser />;
}
