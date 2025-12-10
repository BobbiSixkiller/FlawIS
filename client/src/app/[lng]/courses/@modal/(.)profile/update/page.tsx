import { getMe } from "@/app/[lng]/(auth)/actions";
import UserForm from "@/app/[lng]/(auth)/register/UserForm";
import Modal from "@/components/Modal";
import { translate } from "@/lib/i18n";
import { getSubdomain } from "@/utils/actions";
import { headers } from "next/headers";

export default async function UpdateProfilePage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const { t } = await translate(lng, "profile");

  const subdomain = await getSubdomain();
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
