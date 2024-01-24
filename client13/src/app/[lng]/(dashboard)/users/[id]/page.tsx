import { useTranslation } from "@/lib/i18n";
import { getUser, toggleVerified } from "../actions";
import Heading from "@/components/Heading";
import { Back } from "@/components/Button";
import UserUpdateDialog from "./UserUpdateDialog";
import Toggle from "@/components/Toggle";
import { notFound } from "next/navigation";

export default async function User({
  params: { id, lng },
}: {
  params: { lng: string; id: string };
  searchParams: {};
}) {
  const user = await getUser(id);

  const { t } = await useTranslation(lng, ["profile", "common"]);

  if (!user) {
    return notFound();

    // return (
    //   <div className="container mx-auto flex flex-col gap-6">
    //     <Back />
    //     <h1 className="text-xl font-semibold leading-7 text-gray-900">
    //       User not found!
    //     </h1>
    //   </div>
    // );
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <Back />
        <Heading
          heading={user.name}
          actions={<UserUpdateDialog lng={lng} user={user} />}
        />
      </div>

      <div className="mt-6 border-t border-gray-100">
        <dl className="divide-y divide-gray-100">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              {t("name")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {user.name}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              {t("email")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {user.email}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              {t("org")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {user.organization}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              {t("phone")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {user.telephone}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              {t("role")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {user.role}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 items-center">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              {t("status")}
            </dt>
            <dd
              className={`mt-1 text-sm leading-6 ${
                user.verified ? "text-green-500" : "text-red-500"
              } sm:col-span-2 sm:mt-0 flex justify-between items-center`}
            >
              <span>{user.verified ? "Overeny" : "Neovereny"}</span>
              <Toggle
                defaultChecked={user.verified}
                handleToggle={async () => {
                  "use server";
                  await toggleVerified(user.id);
                }}
              />
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
