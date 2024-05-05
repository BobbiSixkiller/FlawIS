"use server";

import {
  CreateSubmissionDocument,
  SubmissionInput,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import parseValidationErrors, { ErrorException } from "@/utils/parseErrors";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function createSubmission(data: SubmissionInput) {
  try {
    const user = cookies().get("user")?.value;

    const res = await executeGqlFetch(CreateSubmissionDocument, {
      data,
    });
    if (res.errors) {
      console.log(res.errors[0], data);
      const { validationErrors } = res.errors[0].extensions as ErrorException;

      throw new Error(
        validationErrors
          ? Object.values(parseValidationErrors(validationErrors)).join(" ")
          : res.errors[0].message
      );
    }

    revalidateTag(`conference:${user}`);
    return { success: true, message: res.data.createSubmission.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
