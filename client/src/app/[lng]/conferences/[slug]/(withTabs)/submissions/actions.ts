"use server";

import {
  CreateSubmissionDocument,
  CreateSubmissionMutationVariables,
  DeleteSubmissionDocument,
  SubmissionDocument,
  UpdateSubmissionDocument,
  UpdateSubmissionMutationVariables,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch, executeGqlMutation } from "@/utils/actions";

export async function getSubmission(id?: string) {
  if (!id) return;

  const res = await executeGqlFetch(SubmissionDocument, { id });
  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.submission;
}

export async function createSubmission(
  vars: CreateSubmissionMutationVariables,
  fromAddAttendee?: boolean
) {
  const res = await executeGqlMutation(
    CreateSubmissionDocument,
    vars,
    (data) => ({
      message: data.createSubmission.message,
      data: data.createSubmission.data,
    }),
    {
      revalidateTags: (data) => [
        `conferences:${data.createSubmission.data.conference.slug}`,
      ],
    }
  );

  if (!res.success && res.errors && fromAddAttendee) {
    const transformedErrors: Record<string, string> = {};
    for (const [key, value] of Object.entries(res.errors)) {
      transformedErrors[`submission.${key}`] = value;
    }

    return {
      ...res,
      errors: transformedErrors,
    };
  }

  return res;
}

export async function updateSubmission(
  vars: UpdateSubmissionMutationVariables
) {
  return await executeGqlMutation(
    UpdateSubmissionDocument,
    vars,
    (data) => ({
      message: data.updateSubmission.message,
      data: data.updateSubmission.data,
    }),
    {
      revalidateTags: (data) => [
        `conferences:${data.updateSubmission.data.conference.slug}`,
      ],
    }
  );
}

export async function deleteSubmission(id: string) {
  return await executeGqlMutation(
    DeleteSubmissionDocument,
    { id },
    (data) => ({
      message: data.deleteSubmission.message,
      data: data.deleteSubmission.data,
    }),
    {
      revalidateTags: (data) => [
        `conferences:${data.deleteSubmission.data.conference.slug}`,
      ],
    }
  );
}
