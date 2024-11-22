"use server";

import { getMe } from "@/app/[lng]/(auth)/actions";
import {
  SubmissionInput,
  UpdateSubmissionDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import parseValidationErrors, { ErrorException } from "@/utils/parseErrors";
import { revalidateTag } from "next/cache";

export async function updateSubmission(id: string, data: SubmissionInput) {
  try {
    const res = await executeGqlFetch(UpdateSubmissionDocument, {
      id,
      data,
    });

    if (res.errors) {
      const { validationErrors } = res.errors[0].extensions as ErrorException;

      throw new Error(
        validationErrors
          ? Object.values(parseValidationErrors(validationErrors)).join(" ")
          : res.errors[0].message
      );
    }

    revalidateTag(
      `conference:${res.data.updateSubmission.data.conference.slug}`
    );

    return { success: true, message: res.data.updateSubmission.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
