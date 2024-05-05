"use server";

import { GetDataFilter } from "@/components/withInfiniteScroll";
import { AttendeesDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";

export async function getAttendees(filter: GetDataFilter) {
  const res = await executeGqlFetch(
    AttendeesDocument,
    {
      ...filter,
      conferenceSlug: filter.conferenceSlug,
    },
    {},
    { tags: ["attendees", `attendees:${filter}`], revalidate: 3600 }
  );

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.attendees;
}
