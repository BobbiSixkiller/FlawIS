"use server";

import { SubmissionDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import { notFound } from "next/navigation";

export async function getSubmission(id: string) {
  const res = await executeGqlFetch(
    SubmissionDocument,
    { id },
    {},
    {},
    "no-store"
  );

  if (res.errors) {
    console.log(res.errors[0]);
    return notFound();
  }

  return res.data?.submission;
}
