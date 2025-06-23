import ListAttendees from "./ListAttendees";
import { getAttendees } from "./actions";
import AttendeeFilter from "./AttendeeFilter";
import { getConference } from "../../actions";

import ExportButton from "./ExportButton";

export default async function AttendeesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lng: string; slug: string }>;
  searchParams?: Promise<{ passive?: string; sectionId?: string[] }>;
}) {
  const { lng, slug } = await params;
  const queryParams = await searchParams;
  const [initialData, conference] = await Promise.all([
    getAttendees({
      passive: queryParams?.passive ? queryParams.passive === "true" : null,
      conferenceSlug: slug,
      sectionIds: queryParams?.sectionId
        ? Array.isArray(queryParams?.sectionId)
          ? queryParams.sectionId
          : [queryParams.sectionId]
        : [],
    }),
    getConference(slug),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <ExportButton />
        <AttendeeFilter sections={conference.sections} />
        <div className="ml-auto text-xl font-bold dark:text-white">
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
