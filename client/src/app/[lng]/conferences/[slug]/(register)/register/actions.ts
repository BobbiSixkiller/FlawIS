"use server";

import {
  AcceptAuthorInviteDocument,
  AddAttendeeDocument,
  AttendeeInput,
  CreateSubmissionDocument,
  SubmissionInput,
} from "@/lib/graphql/generated/graphql";
import { executeGqlMutation } from "@/utils/actions";

export async function addAttendee(
  attendeeInput: AttendeeInput,
  submissionId: string | null,
  token: string | null,
  submissionInput?: SubmissionInput
) {
  let submission;
  if (submissionInput && !submissionId) {
    submission = await createSubmission(submissionInput, true);
    if (!submission.success) {
      return submission;
    }
  } else if (submissionInput && submissionId && token) {
    submission = await acceptAuthorInvite(token);
    if (!submission.success) {
      return submission;
    }
  }

  return await executeGqlMutation(
    AddAttendeeDocument,
    {
      data: attendeeInput,
    },
    (data) => ({
      message: data.addAttendee.message,
      data: data.addAttendee.data,
    }),
    {
      revalidateTags: (data) => [
        `conferences:${data.addAttendee.data.slug}`,
        "attendees",
      ],
    }
  );
}

export async function createSubmission(
  data: SubmissionInput,
  fromAddAttendee: boolean = false
) {
  const res = await executeGqlMutation(
    CreateSubmissionDocument,
    { data },
    (data) => ({
      message: data.createSubmission.message,
      data: data.createSubmission.data,
    })
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

export async function acceptAuthorInvite(token: string) {
  return await executeGqlMutation(
    AcceptAuthorInviteDocument,
    {},
    (data) => ({
      message: data.acceptAuthorInvite.message,
      data: data.acceptAuthorInvite.data,
    }),
    {
      revalidateTags: (data) => [
        `conferences:${data.acceptAuthorInvite.data.conference.slug}`,
      ],
    },
    { token }
  );
}
