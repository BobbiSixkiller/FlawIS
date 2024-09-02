import { FormMessage } from "@/components/Message";
import { getConference } from "../../../actions";
import UpdateDatesForm from "./UpdateDatesForm";

export default async function UpdateDatesPage({
  params: { lng, slug },
}: {
  params: { lng: string; slug: string };
}) {
  const conference = await getConference(slug);

  return (
    <div className="flex flex-col gap-6 justify-center items-center">
      <FormMessage lng={lng} />
      <UpdateDatesForm conference={conference} lng={lng} />
    </div>
  );
}
