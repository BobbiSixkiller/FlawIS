import ListAttendees from "./ListAttendees";
import { getAttendees } from "./actions";

export default async function AttendeesPage({
  params: { lng, slug },
}: {
  params: { lng: string; slug: string };
}) {
  const initialData = await getAttendees({ conferenceSlug: slug });

  return initialData ? (
    <ListAttendees lng={lng} initialData={initialData} />
  ) : (
    "Ziadny"
  );
}
