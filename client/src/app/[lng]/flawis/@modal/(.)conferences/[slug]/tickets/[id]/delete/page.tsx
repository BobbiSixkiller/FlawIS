import DeleteTicketForm from "@/app/[lng]/flawis/conferences/[slug]/tickets/[id]/delete/DeleteTicketForm";
import { getConference } from "@/app/[lng]/flawis/conferences/actions";
import Modal from "@/components/Modal";

export default async function DeleteTicketPage({
  params: { lng, slug, id },
}: {
  params: { slug: string; lng: string; id: string };
}) {
  const conference = await getConference(slug);

  return (
    <Modal title="Zmazat listok" dialogId="delete-ticket" i18nIsDynamicList>
      <DeleteTicketForm
        lng={lng}
        ticket={conference?.tickets.find((t) => t.id === id)}
      />
    </Modal>
  );
}
