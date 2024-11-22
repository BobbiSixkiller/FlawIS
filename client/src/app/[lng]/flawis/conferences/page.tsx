import Heading from "@/components/Heading";
import { getConferences } from "./actions";
import ListConferences from "./ListConferences";
import { PlusIcon } from "@heroicons/react/24/outline";
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
      <Heading
        heading={t("heading")}
        subHeading={t("subheading")}
        lng={lng}
        links={[
          {
            href: "/conferences/new",
            text: "Nova",
            icon: <PlusIcon className="size-5" />,
          },
        ]}
      />
      {initialData && <ListConferences initialData={initialData} />}
    </div>
  );
}
