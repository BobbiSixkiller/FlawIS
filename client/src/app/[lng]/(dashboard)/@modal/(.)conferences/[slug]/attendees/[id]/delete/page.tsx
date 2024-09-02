import { getAttendee } from "@/app/[lng]/(dashboard)/conferences/[slug]/@admin/attendees/[id]/actions";
import DeleteAttendeeForm from "@/app/[lng]/(dashboard)/conferences/[slug]/@admin/attendees/[id]/delete/DeleteAttendeeForm";
import { FormMessage } from "@/components/Message";
import Modal from "@/components/Modal";

export default async function DeleteAttendeePage({
  params: { lng, id },
}: {
  params: { lng: string; slug: string; id: string };
}) {
  const attendee = await getAttendee(id);

  return (
    <Modal title="Zmazat ucastnika">
      <FormMessage lng={lng} />
      <DeleteAttendeeForm lng={lng} attendee={attendee} />
    </Modal>
  );
}
