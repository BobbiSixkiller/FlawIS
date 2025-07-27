"use server";

import {
  AttendeesCsvExportDocument,
  AttendeesDocument,
  AttendeesQueryVariables,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";

export async function getAttendees(vars: AttendeesQueryVariables) {
  const res = await executeGqlFetch(AttendeesDocument, vars);

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return (
    res.data?.attendees || {
      totalCount: 0,
      edges: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    }
  );
}

export async function getAllAttendees(slug: string) {
  const res = await executeGqlFetch(AttendeesCsvExportDocument, { slug });

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.attendeesCsvExport || [];
}
