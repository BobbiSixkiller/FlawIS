import DeleteUserForm from "@/app/[lng]/(dashboard)/users/[id]/delete/DeleteUserForm";
import { getUser } from "@/app/[lng]/(dashboard)/users/actions";
import { FormMessage } from "@/components/Message";
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
      <FormMessage lng={lng} />
      <DeleteUserForm user={user} lng={lng} />
    </Modal>
  );
}

export const dynamic = "force-dynamic";
