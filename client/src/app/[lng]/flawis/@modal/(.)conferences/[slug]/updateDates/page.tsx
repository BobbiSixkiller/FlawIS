import UpdateDatesForm from "@/app/[lng]/flawis/conferences/[slug]/updateDates/UpdateDatesForm";
import { getConference } from "@/app/[lng]/flawis/conferences/actions";
import Modal from "@/components/Modal";

export default async function UpdateDatesPage({
  params: { lng, slug },
}: {
  params: { lng: string; slug: string };
}) {
  const conference = await getConference(slug);

  return (
    <Modal
      title="Upravit datumy konferencie"
      dialogId="update-dates"
      isInterceptingRoute
    >
      <UpdateDatesForm conference={conference} lng={lng} />
    </Modal>
  );
}
