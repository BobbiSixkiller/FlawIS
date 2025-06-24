import { getMe } from "../../(auth)/actions";
import Heading from "@/components/Heading";
import { translate } from "@/lib/i18n";
import { PencilIcon } from "@heroicons/react/24/outline";
import Avatar from "@/components/Avatar";

export default async function Profile({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const user = await getMe();

  const { t } = await translate(lng, "profile");

  return (
    <div className="flex flex-col gap-6">
      <Heading
        heading={t("heading")}
        subHeading={t("subheading")}
        lng={lng}
        links={[
          {
            type: "link",
            href: "/profile/update",
            text: t("update"),
            icon: <PencilIcon className="size-5" />,
          },
        ]}
      />

      <div className="border-t border-gray-100 dark:border-gray-700">
        <dl className="divide-y divide-gray-100 dark:divide-gray-700">
          <div className="sm:h-20 py-6 sm:p-0 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white/85">
              {t("name")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-400 sm:col-span-2 sm:mt-0 flex items-center gap-2">
              <Avatar name={user.name} avatarUrl={user.avatarUrl} />
              {user?.name}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white/85">
              {t("email")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-400 sm:col-span-2 sm:mt-0">
              {user?.email}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white/85">
              {t("org")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-400 sm:col-span-2 sm:mt-0">
              {user?.organization}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white/85">
              {t("phone")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-400 sm:col-span-2 sm:mt-0">
              {user?.telephone}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
