import { getMe } from "../../(auth)/actions";
import Heading from "@/components/heading";
import Icon from "@/components/icon";
import { Access } from "@/lib/graphql/generated/graphql";
import Link from "next/link";
import { translate } from "@/lib/i18n";
import Avatar from "@/components/avatar";
import { Button } from "@/components/ui/button";

export default async function Profile({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const { t } = await translate(lng, "profile");
  const user = await getMe();

  return (
    <div className="flex flex-col gap-6">
      <Heading
        heading={t("heading")}
        subHeading={t("subheading")}
        lng={lng}
        items={[
          <Button
            key={0}
            nativeButton={false}
            role="link"
            render={<Link href="/profile/update" />}
          >
            <Icon name="pencil" className="size-5" />
            {t("update")}
          </Button>,
        ]}
      />

      <div className="border-t border-border dark:border-border">
        <dl className="divide-y divide-border dark:divide-border">
          <div className="sm:h-20 py-6 sm:p-0 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
            <dt className="text-sm font-medium leading-6 text-foreground dark:text-foreground">
              {t("name")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-foreground dark:text-muted-foreground  sm:col-span-2 sm:mt-0 flex items-center gap-2">
              <Avatar name={user.name} avatarUrl={user.avatarUrl} />
              {user?.name}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-foreground dark:text-foreground">
              {t("email")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-foreground dark:text-muted-foreground sm:col-span-2 sm:mt-0">
              {user?.email}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-foreground dark:text-foreground">
              {t("org")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-foreground dark:text-muted-foreground sm:col-span-2 sm:mt-0">
              {user?.organization}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-foreground dark:text-foreground">
              {t("phone")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-foreground dark:text-muted-foreground sm:col-span-2 sm:mt-0">
              {user?.telephone || "N/A"}
            </dd>
          </div>
          {user.access.includes(Access.Student) && (
            <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium leading-6 text-foreground dark:text-foreground">
                {t("address")}
              </dt>
              <dd className="mt-1 text-sm leading-6 text-foreground dark:text-muted-foreground sm:col-span-2 sm:mt-0">
                {user.address && Object.values(user.address).join(", ")}
              </dd>
            </div>
          )}
          {user?.access.includes(Access.Student) && (
            <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium leading-6 text-foreground dark:text-foreground">
                {t("studyProgramme")}
              </dt>
              <dd className="mt-1 text-sm leading-6 text-foreground dark:text-muted-foreground sm:col-span-2 sm:mt-0">
                {user?.studyProgramme ? t(user.studyProgramme) : "N/A"}
              </dd>
            </div>
          )}
          {user?.access.includes(Access.Student) && (
            <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium leading-6 text-foreground dark:text-foreground">
                {t("cv")}
              </dt>
              <dd className="mt-1 text-sm leading-6 text-foreground dark:text-muted-foreground sm:col-span-2 sm:mt-0">
                {user?.cvUrl ? (
                  <Link
                    href={`/minio?bucketName=resumes&url=${user.cvUrl}`}
                    className="text-primary hover:underline"
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
