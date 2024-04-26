import Heading from "@/components/Heading";
import { getConference } from "../../../../actions";
import { redirect } from "next/navigation";

export default async function RegisterPage({
  params: { lng, slug },
}: {
  params: { slug: string; lng: string };
}) {
  const conference = await getConference(slug);
  if (conference.attending) {
    redirect(`/conferences/${slug}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <Heading
        lng={lng}
        heading="Registracia"
        subHeading={conference.translations[lng as "sk" | "en"].name}
      />
      <div>forn</div>
    </div>
  );
}
