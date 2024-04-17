import DeleteConferenceForm from "@/app/[lng]/(dashboard)/conferences/[slug]/delete/DeleteConferenceForm";
import { getConference } from "@/app/[lng]/(dashboard)/conferences/actions";
import { FormMessage } from "@/components/Message";
import Modal from "@/components/Modal";

export default async function DeleteConferencePage({
  params: { slug, lng },
}: {
  params: { lng: string; slug: string };
}) {
  const conference = await getConference(slug);

  return (
    <Modal title="Zmazat konferenciu">
      <FormMessage lng={lng} />
      <DeleteConferenceForm lng={lng} conference={conference} />
    </Modal>
  );
}
