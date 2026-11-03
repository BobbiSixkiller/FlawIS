import SearchUser from "./search-user";

export default async function HeaderActions({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  return <SearchUser />;
}
