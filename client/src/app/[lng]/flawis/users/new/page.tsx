import UserForm from "@/app/[lng]/(auth)/register/UserForm";
import Modal from "@/components/Modal";

export default function NewUserPage({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const dialogId = "register-user";

  return (
    <Modal dialogId={dialogId}>
      <UserForm namespace="register" dialogId={dialogId} />
    </Modal>
  );
}
