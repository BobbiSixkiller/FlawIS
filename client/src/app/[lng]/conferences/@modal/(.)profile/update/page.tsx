import { getMe } from "@/app/[lng]/(auth)/actions";
import UserForm from "@/app/[lng]/(auth)/register/UserForm";
import Modal from "@/components/Modal";
import { translate } from "@/lib/i18n";
import { headers } from "next/headers";

export default async function UpdateProfilePage({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const user = await getMe();

  const { t } = await translate(lng, "profile");

  const host = headers().get("host") || ""; // Get the hostname from the request
  const subdomain = host.split(".")[0]; // Parse the subdomain (assuming subdomain is the first part)

  return (
    <Modal title={t("heading")} dialogId="update-profile" isInterceptingRoute>
      <UserForm user={user} namespace="profile" inModal subdomain={subdomain} />
    </Modal>
  );
}
