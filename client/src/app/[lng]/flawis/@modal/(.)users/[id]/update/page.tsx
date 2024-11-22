import UserForm from "@/app/[lng]/(auth)/register/UserForm";
import { getUser } from "@/app/[lng]/flawis/users/actions";
import Modal from "@/components/Modal";
import { translate } from "@/lib/i18n";

export default async function UpdateUserPage({
  params: { id, lng },
}: {
  params: { lng: string; id: string };
}) {
  const user = await getUser(id);

  const { t } = await translate(lng, "common");

  return (
    <Modal title={t("update")}>
      <UserForm user={user} namespace="profile" inModal />
    </Modal>
  );
}
