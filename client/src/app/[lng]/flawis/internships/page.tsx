import Heading from "@/components/Heading";
import { PlusIcon } from "@heroicons/react/24/outline";
import { translate } from "@/lib/i18n";
import { getInternships } from "../../internships/actions";
import ListInternships from "../../internships/ListInternships";

export default async function InternshipsPage({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const { t } = await translate(lng, "internships");

  const initialData = await getInternships({});

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
      {initialData && <ListInternships initialData={initialData} filter={{}} />}
    </div>
  );
}
