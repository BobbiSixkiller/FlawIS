import Modal from "@/components/Modal";
import { useTranslation } from "@/lib/i18n";
import NewUserForm from "../../../users/new/NewUserForm";
import { FormMessage } from "@/components/Message";

export default async function NewUserPage({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const { t } = await useTranslation(lng, "common");

  return (
    <Modal title={t("new")}>
      <FormMessage lng={lng} />
      <NewUserForm lng={lng} />
    </Modal>
  );
}
