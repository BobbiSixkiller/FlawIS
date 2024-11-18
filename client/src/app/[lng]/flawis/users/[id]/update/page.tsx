import UserForm from "@/app/[lng]/(auth)/register/UserForm";
import { getUser } from "../../actions";
import UpdateUserForm from "./UpdateUserForm";

export default async function UpdateUserPage({
  params: { id, lng },
}: {
  params: { id: string; lng: string };
}) {
  const user = await getUser(id);

  return <UserForm user={user} namespace="profile" />;
}
