import Modal from "@/components/Modal";
import RegistrationInvites from "../../../users/invite/RegistrationInvites";

export default async function InviteOrgModal() {
  return (
    <Modal title="Pozvat organizacie" isInterceptingRoute dialogId="new-org">
      <RegistrationInvites />
    </Modal>
  );
}
