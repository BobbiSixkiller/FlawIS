import UpdateDatesForm from "@/app/[lng]/(dashboard)/conferences/[slug]/@admin/updateDates/UpdateDatesForm";
import { getConference } from "@/app/[lng]/(dashboard)/conferences/actions";
import { FormMessage } from "@/components/Message";
import Modal from "@/components/Modal";

export default async function UpdateDatesPage({
  params: { lng, slug },
}: {
  params: { lng: string; slug: string };
}) {
  const conference = await getConference(slug);

  return (
    <Modal title="Upravit datumy konferencie">
      <FormMessage lng={lng} />
      <UpdateDatesForm conference={conference} lng={lng} />
    </Modal>
  );
}
