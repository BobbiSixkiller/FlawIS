import Heading from "@/components/Heading";
import { getAttendee } from "./actions";
import DownloadPDFButton from "./DownloadPDFButton";
import {
  ArrowsRightLeftIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { redirect } from "next/navigation";
import { capitalizeFirstLetter } from "@/utils/helpers";

export default async function AttendeePage({
  params: { id, lng, slug },
}: {
  params: { slug: string; id: string; lng: string };
}) {
  const attendee = await getAttendee(id);
  if (!attendee) {
    redirect(`/conferences/${slug}/attendees`);
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        className="rounded-full p-2 text-gray-900 hover:bg-gray-100 max-w-fit hover:text-gray-400"
        href={`/conferences/${slug}/attendees`}
        scroll={false}
      >
        <XMarkIcon className="w-5 h-5" />
      </Link>
      <Heading
        lng={lng}
        heading={attendee.user.name}
        subHeading={attendee.user.organization}
        links={[
          {
            href: `/users/${attendee.user.id}/impersonate`,
            text: "Impersonovat",
            icon: <ArrowsRightLeftIcon className="size-5" />,
          },
          {
            href: `/conferences/${slug}/attendees/${id}/delete`,
            text: "Zmazat",
            icon: <TrashIcon className="size-5" />,
          },
        ]}
      />
      <div className="flex gap-2">
        <DownloadPDFButton id={attendee.id} lng={lng} data={attendee} />
        <Link
          scroll={false}
          href={`/conferences/${slug}/attendees/${id}/updateInvoice`}
          className="text-gray-900 rounded-md bg-gray-300 hover:bg-gray-100 max-w-fit hover:text-gray-400 p-2 w-fit hover"
        >
          <PencilIcon className="w-5 h-5" />
        </Link>
      </div>
      {attendee.submissions.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {attendee.submissions.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border p-4 shadow text-gray-900 text-sm focus:outline-primary-500 col-span-2 sm:col-span-1"
            >
              <h2 className="font-medium leading-6">
                {capitalizeFirstLetter(s.translations[lng as "sk" | "en"].name)}
              </h2>
              <p className="leading-none text-gray-500">
                {s.section.translations[lng as "sk" | "en"].name}
                <br />
                {s.id}
              </p>
              <ul className="mt-2 flex gap-1">
                {s.authors.map((a) => (
                  <li key={a.id}>{a.name}</li>
                ))}
              </ul>
              <p>{s.translations[lng as "sk" | "en"].abstract}</p>
              <p>{s.translations[lng as "sk" | "en"].keywords.join(" • ")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
