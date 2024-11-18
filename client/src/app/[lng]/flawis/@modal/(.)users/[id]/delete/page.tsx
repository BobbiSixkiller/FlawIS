import DeleteUserForm from "@/app/[lng]/flawis/users/[id]/delete/DeleteUserForm";
import { getUser } from "@/app/[lng]/flawis/users/actions";
import Modal from "@/components/Modal";
import { useTranslation } from "@/lib/i18n";

export default async function DeleteUserPage({
  params: { id, lng },
}: {
  params: { lng: string; id: string };
}) {
  const user = await getUser(id);

  const { t } = await useTranslation(lng, "common");

  return (
    <Modal title={t("delete")}>
      <DeleteUserForm user={user} lng={lng} />
    </Modal>
  );
}
