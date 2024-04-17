import { Role } from "@/lib/graphql/generated/graphql";
import { getMe } from "../../(auth)/actions";
import { redirect } from "next/navigation";
import Heading from "@/components/Heading";
import { useTranslation } from "@/lib/i18n";
import { getUsers } from "./actions";
import ListUsers from "./ListUsers";
import { NewUserLink } from "./new/NewUserForm";

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

  const initialData = await getUsers();

  return (
    <div className="flex flex-col gap-6">
      <Heading
        lng={lng}
        heading="Users"
        subHeading="Pouzivatelia registrovani v systeme"
        links={[<NewUserLink key={0} />]}
      />
      {initialData && <ListUsers initialData={initialData} lng={lng} />}
    </div>
  );
}
