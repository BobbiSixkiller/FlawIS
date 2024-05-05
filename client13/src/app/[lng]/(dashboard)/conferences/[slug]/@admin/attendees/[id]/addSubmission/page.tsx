import { getAttendee } from "../actions";

export default async function AddSubmission({
  params: { lng, slug, id },
}: {
  params: { lng: string; slug: string; id: string };
}) {
  const attendee = await getAttendee(id);
  return <div>submission form</div>;
}
