import DeleteSectionForm from "@/app/[lng]/flawis/conferences/[slug]/sections/[id]/delete/DeleteSectionForm";
import { getConference } from "@/app/[lng]/flawis/conferences/actions";
import Modal from "@/components/Modal";
import { redirect } from "next/navigation";

export default async function DeleteSectionPage({
  params: { lng, slug, id },
}: {
  params: { slug: string; lng: string; id: string };
}) {
  const conference = await getConference(slug);
  const section = conference?.sections.find((s) => s.id === id);
  if (!section) {
    redirect(`/conferences/${slug}/sections`);
  }

  return (
    <Modal title="Zmazat sekciu" dialogId="delete-section" isInterceptingRoute>
      <DeleteSectionForm lng={lng} section={section} />
    </Modal>
  );
}
