import { TicketFragment } from "@/lib/graphql/generated/graphql";
import { getConference } from "../../../../../actions";
import UpdateTicketForm from "./UpdateTicketForm";

export default async function UpdateTicketPage({
  params: { id, lng, slug },
}: {
  params: { lng: string; slug: string; id: string };
}) {
  const conference = await getConference(slug);

  return (
    <div className="flex justify-center">
      <UpdateTicketForm
        lng={lng}
        ticket={conference?.tickets.find((t) => t.id === id) as TicketFragment}
      />
    </div>
  );
}
