import { redirect } from "next/navigation";
import Heading from "@/components/Heading";
import { displayDate } from "@/utils/helpers";
import DynamicImage from "@/components/DynamicImage";
import { getConference } from "@/app/[lng]/flawis/conferences/actions";
import DownloadPDFButton from "@/app/[lng]/flawis/conferences/[slug]/attendees/[id]/DownloadPDFButton";
import { translate } from "@/lib/i18n";

export default async function ConferencePage({
  params: { lng, slug },
}: {
  params: { slug: string; lng: string };
}) {
  const { t } = await translate(lng, "conferences");
  const conference = await getConference(slug);
  if (conference && !conference.attending) {
    redirect(`/${slug}/register`);
  }

  return (
    <div className="text-gray-900 flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <DynamicImage
          alt="conference-logo"
          src={conference!.translations[lng as "sk" | "en"].logoUrl as string}
          className="w-[300px] h-[150px]"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
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
              Zaciatok
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {displayDate(conference.dates.start)}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Koniec
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {displayDate(conference.dates.end)}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Koniec registracie
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {displayDate(conference.dates.regEnd)}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Deadline zaslania prispevkov
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {displayDate(conference.dates.submissionDeadline)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
