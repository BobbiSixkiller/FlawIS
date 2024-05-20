import ImpersonateForm from "@/app/[lng]/(dashboard)/users/[id]/impersonate/ImpersonateForm";
import { getUser } from "@/app/[lng]/(dashboard)/users/actions";
import { FormMessage } from "@/components/Message";
import Modal from "@/components/Modal";
import { useTranslation } from "@/lib/i18n";

export default async function UpdateUserPage({
  params: { id, lng },
}: {
  params: { lng: string; id: string };
}) {
  const user = await getUser(id);

  const { t } = await useTranslation(lng, "common");

  return (
    <Modal title={"Impersonovat"}>
      <FormMessage lng={lng} />
      <ImpersonateForm lng={lng} user={user} />
    </Modal>
  );
}
