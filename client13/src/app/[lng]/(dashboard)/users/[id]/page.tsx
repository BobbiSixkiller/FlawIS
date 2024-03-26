import { useTranslation } from "@/lib/i18n";
import { getUser, toggleVerified } from "../actions";
import Heading from "@/components/Heading";
import Toggle from "@/components/Toggle";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export default async function User({
  params: { id, lng },
}: {
  params: { lng: string; id: string };
  searchParams: {};
}) {
  const user = await getUser(id);

  const { t } = await useTranslation(lng, ["profile", "common"]);

  if (!user) {
    redirect("/users");
  }

  return (
    <div>
      <Heading
        heading={user.name}
        links={[
          <Link
            key={0}
            href={`/users/${id}/update`}
            scroll={false}
            className="flex gap-2"
          >
            <PencilIcon className="h-5 w-5" /> Update
          </Link>,
          <Link
            key={1}
            href={`/users/${id}/delete`}
            scroll={false}
            className="flex gap-2"
          >
            <TrashIcon className="h-5 w-5" /> Delete
          </Link>,
        ]}
      />
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
