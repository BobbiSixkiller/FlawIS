import { getUser } from "../../actions";
import DeleteUserForm from "../DeleteUserForm";

export default async function DeleteUserPage({
  params: { id, lng },
}: {
  params: { lng: string; id: string };
}) {
  const user = await getUser(id);

  return <DeleteUserForm lng={lng} user={user} />;
}
