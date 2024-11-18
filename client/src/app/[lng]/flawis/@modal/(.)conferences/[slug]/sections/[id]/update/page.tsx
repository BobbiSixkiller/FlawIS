import UpdateSectionForm from "@/app/[lng]/flawis/conferences/[slug]/sections/[id]/update/UpdateSectionForm";
import { getConference } from "@/app/[lng]/flawis/conferences/actions";
import Modal from "@/components/Modal";
import { redirect } from "next/navigation";

export default async function UpdateSection({
  params: { id, lng, slug },
}: {
  params: { lng: string; slug: string; id: string };
}) {
  const conference = await getConference(slug);
  const section = conference?.sections.find((s) => s.id === id);
  if (!section) {
    redirect(`/conferences/${slug}/sections`);
  }

  return (
    <Modal title="Aktualizovat sekciu">
      <UpdateSectionForm lng={lng} section={section} />
    </Modal>
  );
}
