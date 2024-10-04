import SearchUser from "../SearchUser";

export default async function Sidebar({
  params: { lng },
}: {
  params: { lng: string };
}) {
  return <SearchUser />;
}
