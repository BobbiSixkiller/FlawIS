"use server";

import {
  SubmissionInput,
  UnsetSubmissionFileDocument,
  UpdateSubmissionDocument,
} from "@/lib/graphql/generated/graphql";
import { deleteFiles, uploadFile } from "@/lib/minio";
import { executeGqlFetch } from "@/utils/actions";
import parseValidationErrors, { ErrorException } from "@/utils/parseErrors";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function updateSubmission(id: string, data: SubmissionInput) {
  try {
    const user = cookies().get("user")?.value;

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
    revalidateTag(`conference:${user}`);
    return { success: true, message: res.data.updateSubmission.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function uploadSubmissionFile(data: FormData): Promise<string[]> {
  const files = data.getAll("files") as File[];
  const conference = data.get("conferenceSlug") as string;
  const section = data.get("section") as string;

  try {
    const res = await Promise.all(
      files.map((f) => uploadFile(conference, `${section}/${f.name}`, f))
    );

    return res;
  } catch (error: any) {
    console.log(error.message);
    return [];
  }
}

export async function deleteSubmissionFile(
  fileUrl: string,
  conferenceSlug: string,
  submissionId: string
) {
  const apiRes = await executeGqlFetch(UnsetSubmissionFileDocument, {
    id: submissionId,
  });

  const minioRes = await deleteFiles(conferenceSlug, [
    fileUrl.replace(`http://minio:9000/${conferenceSlug.toLowerCase()}/`, ""),
  ]);

  return minioRes && !apiRes.errors;
}
