import { getMe } from "@/app/[lng]/(auth)/actions";
import UserForm from "@/app/[lng]/(auth)/register/UserForm";
import Modal from "@/components/Modal";
import { translate } from "@/lib/i18n";
import { headers } from "next/headers";

export default async function UpdateProfilePage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const { t } = await translate(lng, "profile");

  const headerStore = await headers();
  const host = headerStore.get("host") || ""; // Get the hostname from the request
  const subdomain = host.split(".")[0]; // Parse the subdomain (assuming subdomain is the first part)

  const dialogId = "update-profile";

  const user = await getMe();

  return (
    <Modal title={t("heading")} dialogId="update-profile" isInterceptingRoute>
      <UserForm
        user={user}
        namespace="profile"
        dialogId={dialogId}
        subdomain={subdomain}
      />
    </Modal>
  );
}
