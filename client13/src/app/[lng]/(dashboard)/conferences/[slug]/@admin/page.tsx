import Image from "next/image";
import { getConference } from "../../actions";
import Heading from "@/components/Heading";
import Link from "next/link";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { redirect } from "next/navigation";

export default async function ConferencePage({
  params: { lng, slug },
}: {
  params: { slug: string; lng: string };
}) {
  const conference = await getConference(slug);
  if (!conference) {
    redirect("/conferences");
  }

  return (
    <div className="text-gray-900 flex flex-col gap-6">
      <Image
        style={{
          width: "auto",
          height: "auto",
          maxWidth: "300px",
          maxHeight: "200px",
        }}
        alt="conference-logo"
        src={conference.translations[lng as "sk" | "en"].logoUrl as string}
        width={300}
        height={200}
      />
      <Heading
        lng={lng}
        heading={conference.slug}
        subHeading={conference.translations[lng as "sk" | "en"].name}
        links={[
          <Link
            key={0}
            href={`/conferences/${slug}/updateDates`}
            className="flex gap-2"
            scroll={false}
          >
            <PencilIcon className="w-5 h-5" />
            Aktualizovat
          </Link>,
          ,
          <Link
            key={1}
            href={`/conferences/${slug}/delete`}
            className="flex gap-2 p-2 sm:p-0"
            scroll={false}
          >
            <TrashIcon className="w-5 h-5" />
            Zmazat
          </Link>,
        ]}
      />
      <div className="border-t border-gray-100">
        <dl className="divide-y divide-gray-100">
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Zaciatok
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {new Date(conference.dates.start).toString()}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Koniec
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {new Date(conference.dates.end).toString()}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Koniec registracie
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {conference.dates.regEnd
                ? new Date(conference.dates.regEnd).toString()
                : ""}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Deadline zaslania prispevkov
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {conference.dates.submissionDeadline
                ? new Date(conference.dates.submissionDeadline).toString()
                : ""}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
