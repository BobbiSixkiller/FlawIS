import Image from "next/image";
import { getConference } from "../actions";
import Heading from "@/components/Heading";

export default async function ConferencePage({
  params: { lng, slug },
}: {
  params: { slug: string; lng: string };
}) {
  const conference = await getConference(slug);

  return (
    <div className="rounded-2xl border p-4 shadow text-gray-900 flex gap-4">
      <Image
        style={{ width: "auto", height: "auto" }}
        alt="conference-logo"
        src={conference.translations[lng as "sk" | "en"].logoUrl as string}
        width={300}
        height={200}
      />
      <div>
        <Heading heading={conference.translations[lng as "sk" | "en"].name} />
      </div>
    </div>
  );
}
