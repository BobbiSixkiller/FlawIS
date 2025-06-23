"use server";

import { TextSearchConferenceDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";

export async function searchConference(params: { text: string }) {
  const res = await executeGqlFetch(TextSearchConferenceDocument, params);

  return res.data?.textSearchConference || [];
}
