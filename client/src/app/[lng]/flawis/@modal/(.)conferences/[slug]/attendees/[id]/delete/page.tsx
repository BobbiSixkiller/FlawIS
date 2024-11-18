import { getAttendee } from "@/app/[lng]/flawis/conferences/[slug]/attendees/[id]/actions";
import DeleteAttendeeForm from "@/app/[lng]/flawis/conferences/[slug]/attendees/[id]/delete/DeleteAttendeeForm";
import Modal from "@/components/Modal";

export default async function DeleteAttendeePage({
  params: { lng, id },
}: {
  params: { lng: string; slug: string; id: string };
}) {
  const attendee = await getAttendee(id);

  return (
    <Modal title="Zmazat ucastnika">
      <DeleteAttendeeForm lng={lng} attendee={attendee} />
    </Modal>
  );
}
