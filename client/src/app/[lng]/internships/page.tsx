import Heading from "@/components/Heading";
import { translate } from "@/lib/i18n";
import { PlusIcon } from "@heroicons/react/24/outline";
import { getMe } from "../(auth)/actions";
import { Access } from "@/lib/graphql/generated/graphql";
import ListInternships from "./ListInternships";
import { getAcademicYearInterval } from "@/utils/helpers";
import { getInternships } from "./actions";

export default async function InternshipsHomePage({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const user = await getMe();

  const { t } = await translate(lng, "internships");

  const { startDate, endDate } = getAcademicYearInterval();

  // refactor to display
  const filter = user.access.includes(Access.Organization)
    ? { user: user.id }
    : { startDate, endDate };

  const initialData = await getInternships(filter);

  return (
    <div className="flex flex-col gap-6">
      <Heading
        lng={lng}
        heading={t("heading")}
        subHeading={t("subHeading")}
        links={
          user.access.includes(Access.Organization)
            ? [
                {
                  href: "/new",
                  text: "Novy",
                  icon: <PlusIcon className="size-5" />,
                },
              ]
            : undefined
        }
      />
      <ListInternships initialData={initialData} filter={filter} />
    </div>
  );
}
