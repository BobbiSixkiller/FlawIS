"use server";

import {
  AddAttendeeDocument,
  AttendeeInput,
  CreateSubmissionDocument,
  SubmissionDocument,
  SubmissionInput,
  UpdateSubmissionDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import parseValidationErrors, { ErrorException } from "@/utils/parseErrors";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function addAttendee(
  attendeeInput: AttendeeInput,
  submissionId: string | null,
  submissionInput?: SubmissionInput
) {
  try {
    const res = await executeGqlFetch(AddAttendeeDocument, {
      data: attendeeInput,
    });
    let submission;

    if (res.errors) {
      const { validationErrors } = res.errors[0].extensions as ErrorException;

      throw new Error(
        validationErrors
          ? Object.values(parseValidationErrors(validationErrors)).join(" ")
          : res.errors[0].message
      );
    }

    if (submissionInput && !submissionId) {
      submission = await executeGqlFetch(CreateSubmissionDocument, {
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
    const user = cookies().get("user")?.value;
    if (user) revalidateTag(`conference:${user}`);

    revalidateTag("attendees");
    return { success: true, message: res.data.addAttendee.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getSubmission(id?: string) {
  if (!id) {
    return;
  }
  //   await new Promise((resolve) => setTimeout(resolve, 5000));
  const res = await executeGqlFetch(
    SubmissionDocument,
    { id },
    {},
    { tags: [`submission:${id}`], revalidate: 3600 }
  );

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.submission;
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

export async function updateSubmission(id: string, data: SubmissionInput) {
  try {
    const res = await executeGqlFetch(UpdateSubmissionDocument, { id, data });
    if (res.errors) {
      const { validationErrors } = res.errors[0].extensions as ErrorException;

      throw new Error(
        validationErrors
          ? Object.values(parseValidationErrors(validationErrors)).join(" ")
          : res.errors[0].message
      );
    }

    return { success: true, message: res.data.updateSubmission.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
