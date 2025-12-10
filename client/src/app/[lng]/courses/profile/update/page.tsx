import { getMe } from "@/app/[lng]/(auth)/actions";
import UserForm from "@/app/[lng]/(auth)/register/UserForm";
import { getSubdomain } from "@/utils/actions";

export default async function UpdateProfilePage(props: {
  params: Promise<{ lng: string }>;
}) {
  const user = await getMe();

  const subdomain = await getSubdomain();

  return (
    <div className="flex justify-center items-center">
      <UserForm user={user} namespace="profile" subdomain={subdomain} />
    </div>
  );
}
