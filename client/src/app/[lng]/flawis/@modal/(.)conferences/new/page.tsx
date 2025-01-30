import Modal from "@/components/Modal";
import NewConferenceForm from "../../../conferences/new/NewConferenceForm";
import { FormMessage } from "@/components/Message";

export default function NewConferencePage({
  params: { lng },
}: {
  params: { lng: string };
}) {
  return (
    <Modal
      title="Nova konferencia"
      dialogId="new-conference"
      isInterceptingRoute
    >
      <NewConferenceForm lng={lng} />
    </Modal>
  );
}
