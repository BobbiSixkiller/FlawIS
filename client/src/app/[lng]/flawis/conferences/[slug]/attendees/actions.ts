"use server";

import {
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
