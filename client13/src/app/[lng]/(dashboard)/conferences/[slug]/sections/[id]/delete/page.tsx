import { redirect } from "next/navigation";
import { getConference } from "../../../../actions";
import DeleteSectionForm from "./DeleteSectionForm";
import { FormMessage } from "@/components/Message";

export default async function DeleteSectionPage({
  params: { id, slug, lng },
}: {
  params: { slug: string; id: string; lng: string };
}) {
  const conference = await getConference(slug);
  const section = conference.sections.find((s) => s.id === id);

  if (!section) {
    redirect(`/conference/${slug}/sections`);
  }

  return (
    <div className="flex flex-col gap-6 justify-between items-center">
      <FormMessage lng={lng} />
      <DeleteSectionForm lng={lng} section={section} />
    </div>
  );
}
