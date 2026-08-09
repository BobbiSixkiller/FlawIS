"use server";

import {
  AcceptAuthorInviteDocument,
  AddAttendeeDocument,
  AttendeeInput,
  CreateSubmissionMutationVariables,
} from "@/lib/graphql/generated/graphql";
import { executeGqlMutation } from "@/lib/graphql/actions";

export async function addAttendee(
  attendeeInput: AttendeeInput,
  token: string | null,
  submissionInput?: CreateSubmissionMutationVariables,
) {
  const registration = await executeGqlMutation(
    AddAttendeeDocument,
    {
      data: {
        ...attendeeInput,
        initialSubmission:
          submissionInput && !token ? submissionInput.data : undefined,
      },
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
    },
  );

  if (!registration.success) {
    if (submissionInput && registration.errors) {
      const submissionFields = new Set([
        "authors",
        "conference",
        "fileUrl",
        "presentationLng",
        "section",
        "translations",
      ]);
      registration.errors = Object.fromEntries(
        Object.entries(registration.errors).map(([key, value]) => {
          const root = key.split(".")[0];
          return submissionFields.has(root)
            ? [`submission.${key}`, value]
            : [key, value];
        }),
      );
    }
    return registration;
  }

  if (submissionInput && !token) {
    return registration;
  } else if (submissionInput && token) {
    const invitation = await acceptAuthorInvite(token);
    if (!invitation.success) return invitation;
  }

  return registration;
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
    { token },
  );
}
