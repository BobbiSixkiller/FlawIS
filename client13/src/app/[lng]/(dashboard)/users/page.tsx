import { Role } from "@/lib/graphql/generated/graphql";
import { getMe } from "../../(auth)/actions";
import { redirect } from "next/navigation";
import Heading from "@/components/Heading";
import { useTranslation } from "@/lib/i18n";
import AddUserDialog from "./AddUserDialog";
import { getUsers } from "./actions";
import Link from "next/link";

export default async function Users({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const { t } = await useTranslation(lng, "users");

  const user = await getMe();
  if (user?.role !== Role.Admin) {
    redirect("/conferences");
  }

  const users = await getUsers();

  return (
    <div className="flex flex-col gap-6">
      <Heading
        heading={t("heading")}
        subHeading={t("subheading")}
        actions={<AddUserDialog lng={lng} />}
      />
      <div className="flex flex-col gap-4">
        {users.edges.map((e) => (
          <Link
            key={e?.cursor}
            className="rounded-2xl border p-4 shadow text-gray-900 text-sm cursor-pointer focus:outline-primary-500"
            href={`/users/${e?.node.id}`}
          >
            <h2 className="font-medium leading-6">{e?.node.name}</h2>
            <p className="leading-none text-gray-500">{e?.node.organization}</p>
            <p className="mt-2">Email: {e?.node.email}</p>
            <p>Rola: {e?.node.role}</p>
            <p
              className={`${
                e?.node.verified ? "text-green-500" : "text-red-500"
              }`}
            >
              {e?.node.verified ? "Ucet overeny" : "Ucet neovereny"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
