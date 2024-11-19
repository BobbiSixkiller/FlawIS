import { getMe } from "@/app/[lng]/(auth)/actions";
import UserForm from "@/app/[lng]/(auth)/register/UserForm";
import Modal from "@/components/Modal";
import { useTranslation } from "@/lib/i18n";

export default async function UpdateProfilePage({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const user = await getMe();

  const { t } = await useTranslation(lng, "profile");

  return (
    <Modal title={t("heading")}>
      <UserForm user={user} namespace="profile" inModal />
    </Modal>
  );
}
