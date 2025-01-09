"use server";

import {
  CreateInternDocument,
  UpdateInternFilesDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import { revalidateTag } from "next/cache";

export async function createIntern(fileUrls: string[], internshipId: string) {
  const res = await executeGqlFetch(CreateInternDocument, {
    fileUrls,
    internshipId,
  });
  if (res.errors) {
    console.log(res.errors[0]);
    return { success: false, message: res.errors[0].message };
  }

  revalidateTag("internships");
  revalidateTag(`internship:${internshipId}`);

  return { success: true, message: res.data.createIntern.message };
}

export async function changeInternFiles(id: string, fileUrls: string[]) {
  const res = await executeGqlFetch(UpdateInternFilesDocument, {
    id,
    fileUrls,
  });
  if (res.errors) {
    console.log(res.errors[0]);
    return { success: false, message: res.errors[0].message };
  }

  console.log(res.data.updateInternFiles);

  revalidateTag(`internship:${res.data.updateInternFiles.data.internship}`);

  return { success: true, message: res.data.updateInternFiles.message };
}
