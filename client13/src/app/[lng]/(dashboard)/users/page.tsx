import { Role } from "@/lib/graphql/generated/graphql";
import { getMe } from "../../(auth)/actions";
import { redirect } from "next/navigation";
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
  const { t } = await useTranslation(lng, "users");

  const user = await getMe();
  if (user?.role !== Role.Admin) {
    redirect("/");
  }

  const initialData = await getUsers({});

  return (
    <div className="flex flex-col gap-6">
      <Heading
        lng={lng}
        heading="Users"
        subHeading="Pouzivatelia registrovani v systeme"
        links={[
          {
            href: "/users/new",
            text: "Novy",
            icon: <PlusIcon className="size-5" />,
          },
        ]}
      />
      {initialData && <ListUsers initialData={initialData} lng={lng} />}
    </div>
  );
}
