"use server";

import {
  AcceptAuthorInviteDocument,
  AddAttendeeDocument,
  AttendeeInput,
  CreateSubmissionMutationVariables,
} from "@/lib/graphql/generated/graphql";
import { executeGqlMutation } from "@/utils/actions";
import { createSubmission } from "../../(withTabs)/submissions/actions";

export async function addAttendee(
  attendeeInput: AttendeeInput,
  submissionId: string | null,
  token: string | null,
  submissionInput?: CreateSubmissionMutationVariables
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
        // `conferences:${data.addAttendee.data.slug}`,
        "attendees",
      ],
    }
  );
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
      // this triggers error when this function is called inside rendering of register page server component
      // revalidateTags: (data) => [
      //   `conferences:${data.acceptAuthorInvite.data.conference.slug}`,
      // ],
    },
    { token }
  );
}
