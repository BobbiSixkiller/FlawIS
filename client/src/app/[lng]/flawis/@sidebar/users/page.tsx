import SearchUser from "./search-user";

export default async function Sidebar({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  return <SearchUser />;
}
