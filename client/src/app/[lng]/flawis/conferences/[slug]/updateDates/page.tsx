import { getConference } from "../../actions";
import UpdateDatesForm from "./UpdateDatesForm";

export default async function UpdateDatesPage({
  params: { lng, slug },
}: {
  params: { lng: string; slug: string };
}) {
  const conference = await getConference(slug);

  return <UpdateDatesForm conference={conference} lng={lng} />;
}
