import DeleteUserForm from "@/app/[lng]/flawis/users/[id]/delete/DeleteUserForm";
import { getUser } from "@/app/[lng]/flawis/users/actions";
import Modal from "@/components/Modal";
import { translate } from "@/lib/i18n";

export default async function DeleteUserPage({
  params: { id, lng },
}: {
  params: { lng: string; id: string };
}) {
  const user = await getUser(id);

  const { t } = await translate(lng, "common");

  return (
    <Modal title={t("delete")} isInterceptingRoute dialogId="delete-user">
      <DeleteUserForm user={user} lng={lng} />
    </Modal>
  );
}
