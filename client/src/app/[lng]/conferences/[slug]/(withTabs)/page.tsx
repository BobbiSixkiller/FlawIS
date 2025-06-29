import { redirect, RedirectType } from "next/navigation";
import Heading from "@/components/Heading";
import { displayDate } from "@/utils/helpers";
import DynamicImage from "@/components/DynamicImage";
import { getConference } from "@/app/[lng]/flawis/conferences/actions";
import DownloadPDFButton from "@/app/[lng]/flawis/conferences/[slug]/attendees/[id]/DownloadPDFButton";
import { translate } from "@/lib/i18n";

export default async function ConferencePage({
  params,
}: {
  params: Promise<{ slug: string; lng: string }>;
}) {
  const { lng, slug } = await params;
  const { t } = await translate(lng, ["conferences"]);
  const conference = await getConference(slug);
  if (
    conference &&
    !conference.attending &&
    new Date(conference.dates.regEnd) < new Date()
  ) {
    redirect("/");
  }
  if (conference && !conference.attending) {
    redirect(`/${slug}/register`);
  }

  return (
    <div className="text-gray-900 flex flex-col gap-6">
      <DynamicImage
        alt="conference-logo"
        src={conference!.translations[lng as "sk" | "en"].logoUrlEnv as string}
        className="w-[300px] h-[150px]"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        style={{ objectFit: "contain" }}
      />

      <Heading
        lng={lng}
        heading={conference!.slug}
        subHeading={conference!.translations[lng as "sk" | "en"].name}
        links={[
          {
            type: "custom",
            element: (
              <DownloadPDFButton lng={lng} data={conference?.attending!} />
            ),
          },
        ]}
      />
      <div className="border-t border-gray-100 dark:border-gray-600">
        <dl className="divide-y divide-gray-100 dark:divide-gray-600">
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              {t("conference.start")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-300">
              {displayDate(conference.dates.start)}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              {t("conference.end")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-300 sm:col-span-2 sm:mt-0">
              {displayDate(conference.dates.end)}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              {t("conference.regEnd")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-300 sm:col-span-2 sm:mt-0">
              {displayDate(conference.dates.regEnd)}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              {t("conference.submissionDeadline")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-300 sm:col-span-2 sm:mt-0">
              {displayDate(conference.dates.submissionDeadline)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
