import { getMe } from "@/app/[lng]/(auth)/actions";
import UserForm from "@/app/[lng]/(auth)/register/UserForm";
import { headers } from "next/headers";

export default async function UpdateProfilePage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const headerStore = await headers();
  const host = headerStore.get("host") || ""; // Get the hostname from the request
  const subdomain = host.split(".")[0]; // Parse the subdomain (assuming subdomain is the first part)

  const user = await getMe();

  return <UserForm user={user} namespace="profile" subdomain={subdomain} />;
}
