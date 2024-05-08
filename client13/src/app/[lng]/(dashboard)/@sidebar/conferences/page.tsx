import { getMe } from "@/app/[lng]/(auth)/actions";
import SearchConference from "./SearchConference";
import { Role } from "@/lib/graphql/generated/graphql";

export default async function Sidebar({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const user = await getMe();

  return user?.role === Role.Admin ? <SearchConference lng={lng} /> : null;
}
