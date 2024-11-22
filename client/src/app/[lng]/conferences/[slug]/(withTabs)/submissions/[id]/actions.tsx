"use server";

import { SubmissionDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";

export async function getSubmission(id?: string) {
  const res = await executeGqlFetch(SubmissionDocument, { id });

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.submission;
}
