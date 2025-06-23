import Modal from "@/components/Modal";
import { getMe } from "@/app/[lng]/(auth)/actions";
import UserForm from "@/app/[lng]/(auth)/register/UserForm";
import { translate } from "@/lib/i18n";
import { getSubdomain } from "@/utils/actions";

export default async function UpdateProfilePage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const { t } = await translate(lng, "profile");

  const user = await getMe();

  const subdomain = await getSubdomain();

  const dialogId = "update-profile";

  return (
    <Modal title={t("heading")} dialogId={dialogId} isInterceptingRoute={true}>
      <UserForm
        user={user}
        namespace="profile"
        dialogId={dialogId}
        subdomain={subdomain}
      />
    </Modal>
  );
}
