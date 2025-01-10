"use server";

import {
  AddAttendeeDocument,
  AttendeeInput,
  CreateSubmissionDocument,
  SubmissionInput,
  UpdateSubmissionDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import parseValidationErrors, { ErrorException } from "@/utils/parseErrors";
import { revalidateTag } from "next/cache";

export async function addAttendee(
  attendeeInput: AttendeeInput,
  submissionId: string | null,
  submissionInput?: SubmissionInput
) {
  try {
    let submission;
    if (submissionInput && !submissionId) {
      submission = await executeGqlFetch(CreateSubmissionDocument, {
        data: submissionInput,
      });
      if (submission.errors) {
        console.log("SUBMISSION ERR ", submission.errors[0]);
        const { validationErrors } = submission.errors[0]
          .extensions as ErrorException;

        throw new Error(
          validationErrors
            ? Object.values(parseValidationErrors(validationErrors)).join(" ")
            : submission.errors[0].message
        );
      }
    } else if (submissionInput && submissionId) {
      submission = await executeGqlFetch(UpdateSubmissionDocument, {
        id: submissionId,
        data: submissionInput,
      });
      if (submission.errors) {
        const { validationErrors } = submission.errors[0]
          .extensions as ErrorException;

        throw new Error(
          validationErrors
            ? Object.values(parseValidationErrors(validationErrors)).join(" ")
            : submission.errors[0].message
        );
      }
    }

    const res = await executeGqlFetch(AddAttendeeDocument, {
      data: attendeeInput,
    });

    if (res.errors) {
      console.log("ATTENDEE ERR ", res.errors[0]);

      const { validationErrors } = res.errors[0].extensions as ErrorException;

      throw new Error(
        validationErrors
          ? Object.values(parseValidationErrors(validationErrors)).join(" ")
          : res.errors[0].message
      );
    }

    revalidateTag(`conference:${res.data.addAttendee.data.slug}`);
    revalidateTag("attendees");
    return { success: true, message: res.data.addAttendee.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function createSubmission(data: SubmissionInput) {
  try {
    const res = await executeGqlFetch(CreateSubmissionDocument, { data });
    if (res.errors) {
      const { validationErrors } = res.errors[0].extensions as ErrorException;

      throw new Error(
        validationErrors
          ? Object.values(parseValidationErrors(validationErrors)).join(" ")
          : res.errors[0].message
      );
    }

    return { success: true, message: res.data.createSubmission.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
