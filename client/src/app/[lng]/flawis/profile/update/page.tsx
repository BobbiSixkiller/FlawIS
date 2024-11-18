import { getMe } from "@/app/[lng]/(auth)/actions";
import UpdateProfileForm from "./UpdateProfileForm";
import UserForm from "@/app/[lng]/(auth)/register/UserForm";

export default async function UpdateProfilePage({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const user = await getMe();

  return <UserForm user={user} namespace="profile" />;
}
