import { getMe } from "@/app/[lng]/(auth)/actions";
import Modal from "@/components/Modal";
import { useTranslation } from "@/lib/i18n";
import UpdateProfileForm from "../../../profile/update/UpdateProfileForm";
import { FormMessage } from "@/components/Message";

export default async function UpdateProfilePage({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const user = await getMe();

  const { t } = await useTranslation(lng, "profile");

  return (
    <Modal title={t("heading")}>
      <FormMessage lng={lng} />
      <UpdateProfileForm lng={lng} user={user} />
    </Modal>
  );
}
