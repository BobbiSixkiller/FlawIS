import { getUser } from "../../../users/actions";

export default async function UserPage({
  params: { id },
}: {
  params: { lng: string; id: string };
}) {
  await getUser(id);

  return null;
}
