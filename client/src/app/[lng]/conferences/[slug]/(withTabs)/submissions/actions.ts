"use server";

import {
  CreateSubmissionDocument,
  DeleteSubmissionDocument,
  SubmissionDocument,
  SubmissionInput,
  UpdateSubmissionDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import parseValidationErrors, { ErrorException } from "@/utils/parseErrors";
import { revalidateTag } from "next/cache";
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
  const user = cookies().get("user")?.value;

  const res = await executeGqlFetch(CreateSubmissionDocument, {
    data,
  });
  if (res.errors) {
    console.log(res.errors[0], data);
    const { validationErrors } = res.errors[0].extensions as ErrorException;

    return {
      success: false,
      message: validationErrors
        ? Object.values(parseValidationErrors(validationErrors)).join(" ")
        : res.errors[0].message,
    };
  }

  revalidateTag(`conference:${user}`);
  return { success: true, message: res.data.createSubmission.message };
}

export async function updateSubmission(id: string, data: SubmissionInput) {
  const res = await executeGqlFetch(UpdateSubmissionDocument, {
    id,
    data,
  });

  if (res.errors) {
    const { validationErrors } = res.errors[0].extensions as ErrorException;

    return {
      success: false,
      message: validationErrors
        ? Object.values(parseValidationErrors(validationErrors)).join(" ")
        : res.errors[0].message,
    };
  }

  revalidateTag(`conference:${res.data.updateSubmission.data.conference.slug}`);
  return { success: true, message: res.data.updateSubmission.message };
}

export async function deleteSubmission(id: string) {
  const user = cookies().get("user")?.value;

  const res = await executeGqlFetch(DeleteSubmissionDocument, { id });
  if (res.errors) {
    return { success: false, message: res.errors[0].message };
  }

  revalidateTag(`conference:${user}`);
  return { success: true, message: res.data.deleteSubmission.message };
}
