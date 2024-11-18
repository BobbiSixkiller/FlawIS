import Heading from "@/components/Heading";
import { useTranslation } from "@/lib/i18n";
import { getUsers } from "./actions";
import ListUsers from "./ListUsers";
import { PlusIcon } from "@heroicons/react/24/outline";

export default async function Users({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const initialData = await getUsers({});

  const { t } = await useTranslation(lng, "users");

  return (
    <div className="flex flex-col gap-6">
      <Heading
        lng={lng}
        heading={t("heading")}
        subHeading="Pouzivatelia registrovani v systeme"
        links={[
          {
            href: "/users/new",
            text: "Novy",
            icon: <PlusIcon className="size-5" />,
          },
        ]}
      />
      {initialData && <ListUsers initialData={initialData} />}
    </div>
  );
}
