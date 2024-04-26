"use server";

import {
  AddAttendeeDocument,
  AttendeeInput,
  SubmissionDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import parseValidationErrors, { ErrorException } from "@/utils/parseErrors";
import { revalidateTag } from "next/cache";

export async function addAttendee(slug: string, attendeeInput: AttendeeInput) {
  try {
    const res = await executeGqlFetch(AddAttendeeDocument, {
      data: attendeeInput,
    });
    if (res.errors) {
      const { validationErrors } = res.errors[0].extensions as ErrorException;

      throw new Error(
        validationErrors
          ? Object.values(parseValidationErrors(validationErrors)).join(" ")
          : res.errors[0].message
      );
    }

    revalidateTag(`conference:${slug}`);
    return { success: true, message: res.data.addAttendee.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getSubmission(id?: string) {
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
