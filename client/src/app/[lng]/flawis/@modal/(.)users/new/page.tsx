import UserForm from "@/app/[lng]/(auth)/register/UserForm";
import Modal from "@/components/Modal";
import { translate } from "@/lib/i18n";

export default async function NewUserPage({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const { t } = await translate(lng, "common");

  return (
    <Modal title={t("new")} dialogId="new-user" isInterceptingRoute>
      <UserForm namespace="register" inModal />
    </Modal>
  );
}
