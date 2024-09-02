import { FormMessage } from "@/components/Message";
import DeleteConferenceForm from "./DeleteConferenceForm";
import { getConference } from "../../../actions";

export default async function DeleteConferencePage({
  params: { lng, slug },
}: {
  params: { lng: string; slug: string };
}) {
  const conference = await getConference(slug);

  return (
    <div className="flex flex-col gap-6 justify-between items-center">
      <FormMessage lng={lng} />
      <DeleteConferenceForm conference={conference} lng={lng} />
    </div>
  );
}
