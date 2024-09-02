import { SectionFragment } from "@/lib/graphql/generated/graphql";
import { getConference } from "../../../../../actions";
import UpdateSectionForm from "./UpdateSectionForm";
import { redirect } from "next/navigation";
import { FormMessage } from "@/components/Message";

export default async function UpdateSection({
  params: { lng, slug, id },
}: {
  params: { lng: string; slug: string; id: string };
}) {
  const conference = await getConference(slug);
  const section = conference?.sections.find((s) => s.id === id);

  if (!section) {
    redirect(`/conference/${slug}/sections`);
  }

  return (
    <div className="flex flex-col gap-6 justify-between items-center">
      <FormMessage lng={lng} />
      <UpdateSectionForm lng={lng} section={section} />
    </div>
  );
}
