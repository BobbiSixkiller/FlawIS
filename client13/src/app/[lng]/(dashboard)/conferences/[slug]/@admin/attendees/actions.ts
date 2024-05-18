"use server";

import { GetDataFilter } from "@/components/withInfiniteScroll";
import {
  AttendeesCsvExportDocument,
  AttendeesDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";

export async function getAttendees(filter: GetDataFilter) {
  const res = await executeGqlFetch(
    AttendeesDocument,
    {
      ...filter,
      conferenceSlug: filter.conferenceSlug,
      passive: filter.passive,
      sectionIds: filter.sectionIds,
    },
    {},
    // { tags: ["attendees", `attendees:${filter}`], revalidate: 3600 }
    {},
    "no-store"
  );

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.attendees;
}

export async function getAllAttendees(slug: string) {
  const res = await executeGqlFetch(
    AttendeesCsvExportDocument,
    { slug },
    {},
    { tags: ["attendees"], revalidate: 3600 }
  );

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.attendeesCsvExport;
}
