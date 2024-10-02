import { getAttendee } from "@/app/[lng]/(dashboard)/conferences/[slug]/@admin/attendees/[id]/actions";
import UpdateInvoiceForm from "@/app/[lng]/(dashboard)/conferences/[slug]/@admin/attendees/[id]/updateInvoice/InvoiceForm";
import { FormMessage } from "@/components/Message";
import Modal from "@/components/Modal";

export default async function UpdateInvoucePage({
  params: { id, lng },
}: {
  params: { lng: string; slug: string; id: string };
}) {
  const attendee = await getAttendee(id);

  return (
    <Modal title="Aktualizovat fakturu">
      <FormMessage lng={lng} />
      <UpdateInvoiceForm lng={lng} invoice={attendee.invoice} />
    </Modal>
  );
}
