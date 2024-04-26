import NewTicketForm from "@/app/[lng]/(dashboard)/conferences/[slug]/@admin/tickets/new/NewTicketForm";
import { getConference } from "@/app/[lng]/(dashboard)/conferences/actions";
import { FormMessage } from "@/components/Message";
import Modal from "@/components/Modal";

export default async function NewSectionPage({
  params: { lng, slug },
}: {
  params: { slug: string; lng: string };
}) {
  const conference = await getConference(slug);

  return (
    <Modal title="Novy listok">
      <FormMessage lng={lng} />
      <NewTicketForm lng={lng} conference={conference} />
    </Modal>
  );
}
