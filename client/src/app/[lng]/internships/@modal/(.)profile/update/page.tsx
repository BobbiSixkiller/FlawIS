import Modal from "@/components/Modal";
import { useTranslation } from "@/lib/i18n";
import UpdateStudentProfile from "../../../profile/update/UpdateStudentProfile";
import { getMe } from "@/app/[lng]/(auth)/actions";
import { Access } from "@/lib/graphql/generated/graphql";
import UserForm from "@/app/[lng]/(auth)/register/UserForm";

export default async function UpdateProfilePage({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const { t } = await useTranslation(lng, "profile");

  const user = await getMe();

  return (
    <Modal title={t("heading")}>
      <UserForm user={user} namespace="profile" />
    </Modal>
  );
}
