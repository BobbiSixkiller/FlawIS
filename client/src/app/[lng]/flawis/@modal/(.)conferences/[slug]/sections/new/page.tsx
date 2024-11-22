import NewSectionForm from "@/app/[lng]/flawis/conferences/[slug]/sections/new/NewSectionForm";
import { getConference } from "@/app/[lng]/flawis/conferences/actions";
import Modal from "@/components/Modal";

export default async function NewSectionPage({
  params: { lng, slug },
}: {
  params: { slug: string; lng: string };
}) {
  const conference = await getConference(slug);

  return (
    <Modal title="Nova sekcia">
      <NewSectionForm lng={lng} conference={conference} />
    </Modal>
  );
}
