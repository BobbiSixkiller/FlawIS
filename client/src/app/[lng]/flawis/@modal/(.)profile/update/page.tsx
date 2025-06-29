import { getMe } from "@/app/[lng]/(auth)/actions";
import Modal from "@/components/Modal";
import UserForm from "@/app/[lng]/(auth)/register/UserForm";
import { translate } from "@/lib/i18n";

export default async function UpdateProfilePage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const user = await getMe();

  const { t } = await translate(lng, "profile");

  const dialogId = "update-profile";

  return (
    <Modal title={t("heading")} dialogId={dialogId} isInterceptingRoute>
      <UserForm user={user} namespace="profile" dialogId={dialogId} />
    </Modal>
  );
}
