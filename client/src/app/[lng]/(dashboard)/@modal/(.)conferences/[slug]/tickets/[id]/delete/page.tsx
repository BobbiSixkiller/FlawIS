import DeleteTicketForm from "@/app/[lng]/(dashboard)/conferences/[slug]/@admin/tickets/[id]/delete/DeleteTicketForm";
import { getConference } from "@/app/[lng]/(dashboard)/conferences/actions";
import { FormMessage } from "@/components/Message";
import Modal from "@/components/Modal";
import { TicketFragment } from "@/lib/graphql/generated/graphql";

export default async function DeleteTicketPage({
  params: { lng, slug, id },
}: {
  params: { slug: string; lng: string; id: string };
}) {
  const conference = await getConference(slug);

  return (
    <Modal title="Zmazat listok">
      <div className="w-96 flex flex-col gap-6">
        <FormMessage lng={lng} />
        <DeleteTicketForm
          lng={lng}
          ticket={conference?.tickets.find((t) => t.id === id)}
        />
      </div>
    </Modal>
  );
}
