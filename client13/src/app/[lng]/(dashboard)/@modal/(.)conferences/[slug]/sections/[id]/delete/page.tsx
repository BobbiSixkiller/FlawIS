import DeleteSectionForm from "@/app/[lng]/(dashboard)/conferences/[slug]/sections/[id]/delete/DeleteSectionForm";
import { getConference } from "@/app/[lng]/(dashboard)/conferences/actions";
import { FormMessage } from "@/components/Message";
import Modal from "@/components/Modal";
import { redirect } from "next/navigation";

export default async function DeleteSectionPage({
  params: { lng, slug, id },
}: {
  params: { slug: string; lng: string; id: string };
}) {
  const conference = await getConference(slug);
  const section = conference.sections.find((s) => s.id === id);
  if (!section) {
    redirect(`/conferences/${slug}/sections`);
  }

  return (
    <Modal title="Zmazat sekciu">
      <FormMessage lng={lng} />
      <DeleteSectionForm lng={lng} section={section} />
    </Modal>
  );
}
