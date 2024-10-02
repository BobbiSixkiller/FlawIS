"use server";

import { TextSearchAttendeeDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";

export async function searchAttendee(text: string) {
  const res = await executeGqlFetch(TextSearchAttendeeDocument, { text });

  return res.data?.textSearchAttendee || [];
}
