import { getMe } from "@/app/[lng]/(auth)/actions";
import UserForm from "@/app/[lng]/(auth)/register/UserForm";
import { headers } from "next/headers";

export default async function UpdateProfilePage(props: {
  params: { lng: string };
}) {
  const user = await getMe();

  const host = headers().get("host") || ""; // Get the hostname from the request
  const subdomain = host.split(".")[0]; // Parse the subdomain (assuming subdomain is the first part)

  return (
    <div className="flex justify-center items-center">
      <UserForm user={user} namespace="profile" subdomain={subdomain} />
    </div>
  );
}
