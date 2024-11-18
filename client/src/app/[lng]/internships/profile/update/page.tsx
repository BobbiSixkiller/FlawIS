import { getMe } from "@/app/[lng]/(auth)/actions";
import UserForm from "@/app/[lng]/(auth)/register/UserForm";

export default async function UpdateProfilePage() {
  const user = await getMe();

  return <UserForm user={user} namespace="profile" />;
}
