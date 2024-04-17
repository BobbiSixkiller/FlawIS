import { getMe } from "@/app/[lng]/(auth)/actions";
import UpdateProfileForm from "./UpdateProfileForm";

export default async function UpdateProfilePage({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const user = await getMe();

  return (
    <div className="flex justify-center">
      <UpdateProfileForm lng={lng} user={user} />
    </div>
  );
}
