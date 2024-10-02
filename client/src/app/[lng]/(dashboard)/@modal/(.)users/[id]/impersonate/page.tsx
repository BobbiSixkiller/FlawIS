import { getMe } from "@/app/[lng]/(auth)/actions";
import ImpersonateForm from "@/app/[lng]/(dashboard)/users/[id]/impersonate/ImpersonateForm";
import { getUser } from "@/app/[lng]/(dashboard)/users/actions";
import { FormMessage } from "@/components/Message";
import Modal from "@/components/Modal";
import { Role } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n";
import { redirect } from "next/navigation";

export default async function UpdateUserPage({
  params: { id, lng },
}: {
  params: { lng: string; id: string };
}) {
  const me = await getMe();
  if (me?.role !== Role.Admin) {
    redirect(`/conferences`);
  }
  const user = await getUser(id);
  if (!user) {
    redirect("/users");
  }

  const { t } = await useTranslation(lng, "common");

  return (
    <Modal title={"Impersonovat"}>
      <FormMessage lng={lng} />
      <ImpersonateForm lng={lng} user={user} />
    </Modal>
  );
}
