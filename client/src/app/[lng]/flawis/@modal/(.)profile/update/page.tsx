import { getMe } from "@/app/[lng]/(auth)/actions";
import Modal from "@/components/Modal";
import { useTranslation } from "@/lib/i18n";
import UserForm from "@/app/[lng]/(auth)/register/UserForm";

export default async function UpdateProfilePage({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const user = await getMe();

  const { t } = await useTranslation(lng, "profile");

  return (
    <Modal title={t("heading")}>
      <UserForm user={user} namespace="profile" />
    </Modal>
  );
}
