import { TicketFragment } from "@/lib/graphql/generated/graphql";
import { getConference } from "../../../../actions";
import DeleteTicketForm from "./DeleteTicketForm";

export default async function DeleteTicketPage({
  params: { id, slug, lng },
}: {
  params: { slug: string; id: string; lng: string };
}) {
  const conference = await getConference(slug);

  return (
    <div className="flex justify-center">
      <DeleteTicketForm
        lng={lng}
        ticket={conference.tickets.find((t) => t.id === id)}
      />
    </div>
  );
}
