import Heading from "@/components/Heading";
import { getConferences } from "../flawis/conferences/actions";
import ListConferences from "./ListConferences";
import { translate } from "@/lib/i18n";

export default async function Conferences({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const { t } = await translate(lng, "conferences");

  const initialData = await getConferences({});

  return (
    <div className="flex flex-col gap-6">
      <Heading heading={t("heading")} subHeading={t("subheading")} lng={lng} />
      {initialData && <ListConferences filter={{}} initialData={initialData} />}
    </div>
  );
}
