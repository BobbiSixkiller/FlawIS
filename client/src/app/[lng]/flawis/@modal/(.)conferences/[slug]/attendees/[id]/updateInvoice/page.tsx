import { getAttendee } from "@/app/[lng]/flawis/conferences/[slug]/attendees/[id]/actions";
import UpdateInvoiceForm from "@/app/[lng]/flawis/conferences/[slug]/attendees/[id]/updateInvoice/InvoiceForm";
import Modal from "@/components/Modal";

export default async function UpdateInvoucePage({
  params: { id, lng },
}: {
  params: { lng: string; slug: string; id: string };
}) {
  const attendee = await getAttendee(id);

  return (
    <Modal title="Aktualizovat fakturu">
      <UpdateInvoiceForm lng={lng} invoice={attendee.invoice} />
    </Modal>
  );
}
