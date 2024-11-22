import Heading from "@/components/Heading";
import { getConferences } from "../flawis/conferences/actions";
import ListConferences from "./ListConferences";
import { translate } from "@/lib/i18n";

export default async function Conferences({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const { t } = await translate(lng, "conferences");

  const initialData = await getConferences({});

  return (
    <div className="flex flex-col gap-6">
      <Heading heading={t("heading")} subHeading={t("subheading")} lng={lng} />
      {initialData && <ListConferences initialData={initialData} />}
    </div>
  );
}
