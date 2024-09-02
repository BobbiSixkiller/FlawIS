import ListAttendees from "./ListAttendees";
import { getAttendees } from "./actions";
import AttendeeFilter from "./AttendeeFilter";
import { getConference } from "../../../actions";
import { TableCellsIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default async function AttendeesPage({
  params: { lng, slug },
  searchParams,
}: {
  params: { lng: string; slug: string };
  searchParams?: { passive?: string; sectionId?: string[] };
}) {
  const [initialData, conference] = await Promise.all([
    getAttendees({
      passive: searchParams?.passive ? searchParams.passive === "true" : null,
      conferenceSlug: slug,
      sectionIds: searchParams?.sectionId
        ? Array.isArray(searchParams?.sectionId)
          ? searchParams.sectionId
          : [searchParams.sectionId]
        : [],
    }),
    getConference(slug),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <Link
          href={`/conferences/${slug}/attendees/export`}
          className="flex items-center gap-2 p-2 rounded-md bg-green-500 hover:bg-green-700 text-white text-sm"
        >
          .csv <TableCellsIcon className="size-5" />
        </Link>
        <AttendeeFilter sections={conference.sections} />
        <div className="ml-auto text-xl font-bold">
          {initialData.totalCount}
        </div>
      </div>

      {initialData.pageInfo.endCursor ? (
        <ListAttendees initialData={initialData} />
      ) : (
        "Ziadny"
      )}
    </div>
  );
}
