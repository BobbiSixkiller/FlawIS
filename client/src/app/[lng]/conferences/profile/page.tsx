import DynamicImage from "@/components/DynamicImage";
import { getMe } from "../../(auth)/actions";
import Heading from "@/components/Heading";
import { translate } from "@/lib/i18n";
import { PencilIcon } from "@heroicons/react/24/outline";

export default async function Profile({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const { t } = await translate(lng, "profile");
  const user = await getMe();

  return (
    <div className="flex flex-col gap-6">
      <Heading
        heading={t("heading")}
        subHeading={t("subheading")}
        lng={lng}
        links={[
          {
            href: "/profile/update",
            text: t("update"),
            icon: <PencilIcon className="size-5" />,
          },
        ]}
      />

      <div className="border-t border-gray-100 dark:border-gray-700">
        <dl className="divide-y divide-gray-100 dark:divide-gray-700">
          <div className="sm:h-20 py-6 sm:p-0 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              {t("name")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-300 sm:col-span-2 sm:mt-0 flex items-center gap-2">
              {user.avatarUrl ? (
                <DynamicImage
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="size-12 rounded-full"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className="size-12 rounded-full flex justify-center items-center bg-primary-300 text-white">
                  {user.name
                    .split(" ")
                    .map((n, i) => {
                      if (i < 2) return n[0].toUpperCase();
                    })
                    .join("")}
                </div>
              )}
              {user?.name}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              {t("email")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-300 sm:col-span-2 sm:mt-0">
              {user?.email}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              {t("org")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-300 sm:col-span-2 sm:mt-0">
              {user?.organization}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              {t("phone")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-300 sm:col-span-2 sm:mt-0">
              {user?.telephone}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
