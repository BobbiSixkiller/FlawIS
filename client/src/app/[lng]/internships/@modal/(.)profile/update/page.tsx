import Modal from "@/components/Modal";
import { getMe } from "@/app/[lng]/(auth)/actions";
import UserForm from "@/app/[lng]/(auth)/register/UserForm";
import { translate } from "@/lib/i18n";
import { headers } from "next/headers";

export default async function UpdateProfilePage({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const { t } = await translate(lng, "profile");

  const user = await getMe();

  const host = headers().get("host") || ""; // Get the hostname from the request
  const subdomain = host.split(".")[0]; // Parse the subdomain (assuming subdomain is the first part)

  const dialogId = "update-profile";

  return (
    <Modal title={t("heading")} dialogId={dialogId} isInterceptingRoute={true}>
      <UserForm
        user={user}
        namespace="profile"
        dialogId={dialogId}
        subdomain={subdomain}
      />
    </Modal>
  );
}
