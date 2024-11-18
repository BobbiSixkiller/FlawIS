import { getConference } from "../../../actions";
import NewTicketForm from "./NewTicketForm";

export default async function NewSectionPage({
  params: { lng, slug },
}: {
  params: { slug: string; lng: string };
}) {
  const conference = await getConference(slug);

  return (
    <div className="flex justify-center">
      <NewTicketForm lng={lng} conference={conference} />
    </div>
  );
}
