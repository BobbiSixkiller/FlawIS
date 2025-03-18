"use server";

import { TextSearchAttendeeDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";

export async function searchAttendee(params: { text: string; slug: string }) {
  const res = await executeGqlFetch(TextSearchAttendeeDocument, params);

  return res.data?.textSearchAttendee || [];
}
