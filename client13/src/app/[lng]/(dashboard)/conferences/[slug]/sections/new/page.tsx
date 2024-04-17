import { getConference } from "../../../actions";
import NewSectionForm from "./NewSectionForm";

export default async function NewSectionPage({
  params: { lng, slug },
}: {
  params: { slug: string; lng: string };
}) {
  const conference = await getConference(slug);

  return (
    <div className="flex justify-center">
      <NewSectionForm lng={lng} conference={conference} />
    </div>
  );
}
