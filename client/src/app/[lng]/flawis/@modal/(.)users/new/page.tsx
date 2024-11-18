import UserForm from "@/app/[lng]/(auth)/register/UserForm";
import Modal from "@/components/Modal";
import { useTranslation } from "@/lib/i18n";

export default async function NewUserPage({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const { t } = await useTranslation(lng, "common");

  return (
    <Modal title={t("new")}>
      <div className="sm:w-96">
        <UserForm namespace="register" />
      </div>
    </Modal>
  );
}
