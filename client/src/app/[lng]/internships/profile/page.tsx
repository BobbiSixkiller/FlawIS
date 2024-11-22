import { getMe } from "../../(auth)/actions";
import Heading from "@/components/Heading";
import { PencilIcon } from "@heroicons/react/24/outline";
import { Access } from "@/lib/graphql/generated/graphql";
import Link from "next/link";
import { translate } from "@/lib/i18n";

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

      <div className="border-t border-gray-100">
        <dl className="divide-y divide-gray-100">
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              {t("name")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {user?.name}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              {t("email")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {user?.email}
            </dd>
          </div>
          {user?.access.includes(Access.Organization) && (
            <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                {t("org")}
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {user?.organization}
              </dd>
            </div>
          )}
          {user?.access.includes(Access.Organization) && (
            <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                {t("phone")}
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {user?.telephone}
              </dd>
            </div>
          )}
          {user?.access.includes(Access.Student) && (
            <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                {t("studyProgramme")}
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {user?.studyProgramme ? t(user.studyProgramme) : "N/A"}
              </dd>
            </div>
          )}
          {user?.access.includes(Access.Student) && (
            <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                {t("cv")}
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {user?.cvUrl ? (
                  <Link
                    href={`/minio?bucketName=resumes&url=${user.cvUrl}`}
                    className="text-primary-500 hover:underline"
                  >
                    CV.pdf
                  </Link>
                ) : (
                  "N/A"
                )}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
