import Heading from "@/components/heading";
import { getConferences } from "../flawis/conferences/actions";
import OfferingList from "@/components/offering-list";
import { translate } from "@/lib/i18n";
import { ConferencesQueryVariables } from "@/lib/graphql/generated/graphql";

export default async function Conferences({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const { t } = await translate(lng, "conferences");

  const vars: ConferencesQueryVariables = { sort: [] };

  const initialData = await getConferences(vars);

  return (
    <div className="flex flex-col gap-6">
      <Heading heading={t("heading")} subHeading={t("subheading")} lng={lng} />
      {initialData ? (
        <OfferingList
          kind="conference"
          vars={vars}
          initialData={initialData}
          hrefBase=""
          lng={lng}
        />
      ) : null}
    </div>
  );
}
