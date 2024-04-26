import NewSectionForm from "@/app/[lng]/(dashboard)/conferences/[slug]/@admin/sections/new/NewSectionForm";
import { getConference } from "@/app/[lng]/(dashboard)/conferences/actions";
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
