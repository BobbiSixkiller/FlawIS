import UpdateTicketForm from "@/app/[lng]/flawis/conferences/[slug]/tickets/[id]/update/UpdateTicketForm";
import { getConference } from "@/app/[lng]/flawis/conferences/actions";
import Modal from "@/components/Modal";
import { TicketFragment } from "@/lib/graphql/generated/graphql";

export default async function UpdateSection({
  params: { id, lng, slug },
}: {
  params: { lng: string; slug: string; id: string };
}) {
  const conference = await getConference(slug);

  return (
    <Modal title="Upravit listok" dialogId="update-ticket" isInterceptingRoute>
      <UpdateTicketForm
        lng={lng}
        ticket={conference?.tickets.find((t) => t.id === id) as TicketFragment}
      />
    </Modal>
  );
}
