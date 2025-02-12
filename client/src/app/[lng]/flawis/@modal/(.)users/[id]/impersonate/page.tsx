import ImpersonateForm from "@/app/[lng]/flawis/users/[id]/impersonate/ImpersonateForm";
import { getUser } from "@/app/[lng]/flawis/users/actions";
import Modal from "@/components/Modal";
import { translate } from "@/lib/i18n";
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

  const { t } = await translate(lng, "common");

  return (
    <Modal title={"Impersonovat"} isInterceptingRoute dialogId="impersonate">
      <ImpersonateForm lng={lng} user={user} />
    </Modal>
  );
}
