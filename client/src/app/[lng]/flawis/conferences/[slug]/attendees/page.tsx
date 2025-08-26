import ListAttendees from "./ListAttendees";
import { getAttendees } from "./actions";
import { getConference } from "../../actions";

import ExportButton from "../../../../../../components/ExportButton";
import FilterDropdown from "@/components/FilterDropdown";
import { AttendeesQueryVariables } from "@/lib/graphql/generated/graphql";

export default async function AttendeesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lng: string; slug: string }>;
  searchParams?: Promise<{ passive?: string; sectionId?: string[] }>;
}) {
  const { lng, slug } = await params;
  const queryParams = await searchParams;

  const vars: AttendeesQueryVariables = {
    sort: [],
    filter: {
      passive: queryParams?.passive ? queryParams.passive === "true" : null,
      conferenceSlug: slug,
      sectionIds: queryParams?.sectionId
        ? Array.isArray(queryParams?.sectionId)
          ? queryParams.sectionId
          : [queryParams.sectionId]
        : [],
    },
  };

  const [initialData, conference] = await Promise.all([
    getAttendees(vars),
    getConference(slug),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <ExportButton fetchUrl={`/conferences/${slug}/attendees/export`} />

        <FilterDropdown
          anchor="bottom"
          filters={[
            {
              label: "Pasivny ucastnici",
              type: "boolean",
              queryKey: "passive",
            },
            {
              label: "Sekcie",
              type: "multi",
              queryKey: "sectionId",
              options: conference.sections.map((s) => ({
                label: s.translations[lng as "sk" | "en"].name,
                value: s.id,
              })),
            },
          ]}
        />
        <div className="ml-auto text-xl font-bold dark:text-white">
          {initialData.totalCount}
        </div>
      </div>

      {initialData.pageInfo.endCursor ? (
        <ListAttendees vars={vars} initialData={initialData} />
      ) : (
        "Ziadny"
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
