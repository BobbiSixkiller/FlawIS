"use server";

import {
  CreateSubmissionDocument,
  DeleteSubmissionDocument,
  SubmissionDocument,
  SubmissionInput,
  UpdateSubmissionDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch, executeGqlMutation } from "@/utils/actions";
import { cookies } from "next/headers";

export async function getSubmission(id?: string) {
  if (!id) return;

  const res = await executeGqlFetch(SubmissionDocument, { id });
  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.submission;
}

export async function createSubmission(data: SubmissionInput) {
  const cookieStore = await cookies();
  const user = cookieStore.get("user")?.value;

  return await executeGqlMutation(
    CreateSubmissionDocument,
    { data },
    (data) => ({
      message: data.createSubmission.message,
      data: data.createSubmission.data,
    }),
    { revalidateTags: (data) => [`conference:${user}`] }
  );
}

export async function updateSubmission(id: string, data: SubmissionInput) {
  return await executeGqlMutation(
    UpdateSubmissionDocument,
    { id, data },
    (data) => ({
      message: data.updateSubmission.message,
      data: data.updateSubmission.data,
    }),
    {
      revalidateTags: (data) => [
        `conference:${data.updateSubmission.data.conference.slug}`,
      ],
    }
  );
}

export async function deleteSubmission(id: string) {
  const cookieStore = await cookies();
  const user = cookieStore.get("user")?.value;

  return executeGqlMutation(
    DeleteSubmissionDocument,
    { id },
    (data) => ({
      message: data.deleteSubmission.message,
      data: data.deleteSubmission.data,
    }),
    { revalidateTags: () => [`conference:${user}`] }
  );
}
