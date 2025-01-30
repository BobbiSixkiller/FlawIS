import DeleteConferenceForm from "@/app/[lng]/flawis/conferences/[slug]/delete/DeleteConferenceForm";
import { getConference } from "@/app/[lng]/flawis/conferences/actions";
import Modal from "@/components/Modal";

export default async function DeleteConferencePage({
  params: { slug, lng },
}: {
  params: { lng: string; slug: string };
}) {
  const conference = await getConference(slug);

  return (
    <Modal
      title="Zmazat konferenciu"
      dialogId="delete-conference"
      isInterceptingRoute
    >
      <DeleteConferenceForm lng={lng} conference={conference} />
    </Modal>
  );
}
