import { redirect } from "next/navigation";
import { getConference } from "../../../../actions";
import DeleteSectionForm from "./DeleteSectionForm";

export default async function DeleteSectionPage({
  params: { id, slug, lng },
}: {
  params: { slug: string; id: string; lng: string };
}) {
  const conference = await getConference(slug);
  const section = conference?.sections.find((s) => s.id === id);

  if (!section) {
    redirect(`/conference/${slug}/sections`);
  }

  return <DeleteSectionForm lng={lng} section={section} />;
}
