import Heading from "@/components/Heading";
import DownloadPDFButton from "./DownloadPDFButton";
import {
  ArrowsRightLeftIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { redirect } from "next/navigation";
import { capitalizeFirstLetter, cn } from "@/utils/helpers";
import RemoveAuthor from "./RemoveAuthor";
import { getAttendee } from "./actions";
import CloseButton from "@/components/CloseButton";

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
      <CloseButton href={`/conferences/${slug}/attendees`} />

      <Heading
        lng={lng}
        heading={attendee.user.name}
        subHeading={
          attendee.user.__typename === "User"
            ? attendee.user.organization
            : "N/A"
        }
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
        <DownloadPDFButton lng={lng} data={attendee} />
        <Link
          scroll={false}
          href={`/conferences/${slug}/attendees/${id}/updateInvoice`}
          className="text-gray-900 rounded-md bg-gray-300 hover:bg-gray-100 max-w-fit hover:text-gray-400 p-2 w-fit hover"
        >
          <PencilIcon className="w-5 h-5" />
        </Link>
      </div>
      {attendee.submissions.length > 0 && (
        <div className="flex flex-col gap-4">
          {attendee.submissions.map((s) => (
            <div
              key={s.id}
              className={cn([
                "rounded-2xl border p-4 shadow text-gray-900 text-sm focus:outline-primary-500 col-span-2 sm:col-span-1",
                "dark:border-gray-700 dark:bg-gray-700 dark:text-white",
              ])}
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
                  <li key={a.id} className="flex gap-1">
                    {a.name}
                    <RemoveAuthor author={a} submission={s} />
                  </li>
                ))}
              </ul>
              <p>{s.translations[lng as "sk" | "en"].abstract}</p>
              <p>{s.translations[lng as "sk" | "en"].keywords.join(" • ")}</p>
              {attendee.ticket.withSubmission && !s.fileUrl && (
                <p className="text-orange-500">Neodovzdal prispevok</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
