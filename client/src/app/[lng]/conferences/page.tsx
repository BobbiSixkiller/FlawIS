import Heading from "@/components/Heading";
import { useTranslation } from "@/lib/i18n";
import { getConferences } from "../flawis/conferences/actions";
import ListConferences from "./ListConferences";

export default async function Conferences({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const { t } = await useTranslation(lng, "conferences");

  const initialData = await getConferences({});

  return (
    <div className="flex flex-col gap-6">
      <Heading heading={t("heading")} subHeading={t("subheading")} lng={lng} />
      {initialData && <ListConferences initialData={initialData} />}
    </div>
  );
}
