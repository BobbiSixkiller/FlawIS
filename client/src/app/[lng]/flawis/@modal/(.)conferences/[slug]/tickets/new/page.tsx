import NewTicketForm from "@/app/[lng]/flawis/conferences/[slug]/tickets/new/NewTicketForm";
import { getConference } from "@/app/[lng]/flawis/conferences/actions";
import Modal from "@/components/Modal";

export default async function NewSectionPage({
  params: { lng, slug },
}: {
  params: { slug: string; lng: string };
}) {
  const conference = await getConference(slug);

  return (
    <Modal title="Novy listok">
      <NewTicketForm lng={lng} conference={conference} />
    </Modal>
  );
}
