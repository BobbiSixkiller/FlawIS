import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";
import DeleteAttendeeForm from "./DeleteAttendeeForm";
import { getAttendee } from "../actions";

export default async function DeleteAttendee({
  params: { lng, slug, id },
}: {
  params: { lng: string; slug: string; id: string };
}) {
  const attendee = await getAttendee(id);

  return (
    <div className="flex flex-col gap-4">
      <Link
        className="rounded-full p-2 text-gray-900 hover:bg-gray-100 max-w-fit hover:text-gray-400"
        href={`/conferences/${slug}/attendees/${id}`}
      >
        <XMarkIcon className="w-5 h-5" />
      </Link>
      <div className="mx-auto w-full sm:mx-auto sm:max-w-96">
        <DeleteAttendeeForm lng={lng} attendee={attendee} />
      </div>
    </div>
  );
}
