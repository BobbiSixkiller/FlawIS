import UpdateTicketForm from "@/app/[lng]/(dashboard)/conferences/[slug]/@admin/tickets/[id]/update/UpdateTicketForm";
import { getConference } from "@/app/[lng]/(dashboard)/conferences/actions";
import { FormMessage } from "@/components/Message";
import Modal from "@/components/Modal";
import { TicketFragment } from "@/lib/graphql/generated/graphql";

export default async function UpdateSection({
  params: { id, lng, slug },
}: {
  params: { lng: string; slug: string; id: string };
}) {
  const conference = await getConference(slug);

  return (
    <Modal title="Upravit listok">
      <div className="w-96 flex flex-col gap-6">
        <FormMessage lng={lng} />
        <UpdateTicketForm
          dialogOpen={true}
          lng={lng}
          ticket={conference.tickets.find((t) => t.id === id) as TicketFragment}
        />
      </div>
    </Modal>
  );
}
