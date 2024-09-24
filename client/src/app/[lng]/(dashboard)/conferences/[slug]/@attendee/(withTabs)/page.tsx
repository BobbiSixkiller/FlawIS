import { redirect } from "next/navigation";
import { getConference } from "../../../actions";
import Image from "next/image";
import Heading from "@/components/Heading";
import DownloadPDFButton from "../../@admin/attendees/[id]/DownloadPDFButton";
import { useTranslation } from "@/lib/i18n";

export default async function ConferencePage({
  params: { lng, slug },
}: {
  params: { slug: string; lng: string };
}) {
  const { t } = await useTranslation(lng, "conferences");
  const conference = await getConference(slug);
  if (conference && !conference.attending) {
    redirect(`/conferences/${slug}/register`);
  }
  return (
    <div className="text-gray-900 flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Image
          style={{
            width: "auto",
            height: "auto",
            maxWidth: "300px",
            maxHeight: "200px",
          }}
          alt="conference-logo"
          src={conference!.translations[lng as "sk" | "en"].logoUrl as string}
          width={300}
          height={200}
        />
        <Heading
          lng={lng}
          heading={conference!.slug}
          subHeading={conference!.translations[lng as "sk" | "en"].name}
        />
        <DownloadPDFButton lng={lng} data={conference?.attending!} />
      </div>
      <div className="border-t border-gray-100">
        <dl className="divide-y divide-gray-100">
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              {t("conference.start")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {new Date(conference!.dates.start).toString()}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              {t("conference.end")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {new Date(conference!.dates.end).toString()}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              {t("conference.regEnd")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {conference!.dates.regEnd
                ? new Date(conference!.dates.regEnd).toString()
                : "N/A"}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              {t("conference.submissionDeadline")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {conference!.dates.submissionDeadline
                ? new Date(conference!.dates.submissionDeadline).toString()
                : "N/A"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
