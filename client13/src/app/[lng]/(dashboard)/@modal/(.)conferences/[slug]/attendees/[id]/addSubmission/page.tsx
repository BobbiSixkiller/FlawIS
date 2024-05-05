import { getAttendee } from "@/app/[lng]/(dashboard)/conferences/[slug]/@admin/attendees/[id]/actions";
import { FormMessage } from "@/components/Message";
import Modal from "@/components/Modal";

export default async function AddSubmissionPage({
  params: { lng, id },
}: {
  params: { lng: string; slug: string; id: string };
}) {
  const attendee = await getAttendee(id);

  return (
    <Modal title="Pridat prispevok">
      <FormMessage lng={lng} />
      add submission
    </Modal>
  );
}
