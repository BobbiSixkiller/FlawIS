import Heading from "@/components/Heading";
import { useTranslation } from "@/lib/i18n";
import { downloadFile } from "@/lib/minio";
import { getConferences } from "./actions";
import ListConferences from "./ListConferences";
import { getMe } from "../../(auth)/actions";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Role } from "@/lib/graphql/generated/graphql";

export default async function Conferences({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const { t } = await useTranslation(lng, "conferences");

  const [user, initialData] = await Promise.all([getMe(), getConferences({})]);

  return (
    <div className="flex flex-col gap-6">
      <Heading
        heading={t("heading")}
        subHeading={t("subheading")}
        lng={lng}
        links={
          user?.role === Role.Admin
            ? [
                {
                  href: "/conferences/new",
                  text: "Nova",
                  icon: <PlusIcon className="size-5" />,
                },
              ]
            : []
        }
      />
      {initialData && <ListConferences initialData={initialData} />}
    </div>
  );
}
