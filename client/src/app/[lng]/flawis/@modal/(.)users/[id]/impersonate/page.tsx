import ImpersonateForm from "@/app/[lng]/flawis/users/[id]/impersonate/ImpersonateForm";
import { getUser } from "@/app/[lng]/flawis/users/actions";
import { FormMessage } from "@/components/Message";
import Modal from "@/components/Modal";
import { useTranslation } from "@/lib/i18n";
import { redirect } from "next/navigation";

export default async function UpdateUserPage({
  params: { id, lng },
}: {
  params: { lng: string; id: string };
}) {
  const user = await getUser(id);
  if (!user) {
    redirect("/users");
  }

  const { t } = await useTranslation(lng, "common");

  return (
    <Modal title={"Impersonovat"}>
      <ImpersonateForm lng={lng} user={user} />
    </Modal>
  );
}
