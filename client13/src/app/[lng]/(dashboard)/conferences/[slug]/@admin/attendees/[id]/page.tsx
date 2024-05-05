import Heading from "@/components/Heading";
import { getAttendee } from "./actions";
import DownloadPDFButton from "./DownloadPDFButton";
import { PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { redirect } from "next/navigation";

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
          <Link
            key={1}
            href={`/conferences/${slug}/attendees/${id}/delete`}
            className="flex gap-2 p-2 sm:p-0"
            scroll={false}
          >
            <TrashIcon className="w-5 h-5" />
            Zmazat
          </Link>,
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
      {attendee.submissions.length > 0 && <div>Prispevky</div>}
    </div>
  );
}
