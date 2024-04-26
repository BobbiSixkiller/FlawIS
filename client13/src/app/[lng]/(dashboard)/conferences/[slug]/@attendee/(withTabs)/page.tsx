import { redirect } from "next/navigation";
import { getConference } from "../../../actions";

export default async function ConferencePage({
  params: { lng, slug },
}: {
  params: { slug: string; lng: string };
}) {
  const conference = await getConference(slug);
  if (!conference.attending) {
    redirect(`/conferences/${slug}/register`);
  }

  return <div>ATTENDEE {slug}</div>;
}
