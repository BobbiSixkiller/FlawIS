"use server";

import {
  CreateInternDocument,
  DeleteInternDocument,
  DeleteInternshipDocument,
  InternshipDocument,
  UpdateInternFilesDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import { revalidateTag } from "next/cache";

export async function getInternship(id: string) {
  //   await new Promise((resolve) => setTimeout(resolve, 5000));
  const res = await executeGqlFetch(
    InternshipDocument,
    { id },
    {},
    { revalidate: 3600, tags: [`internship:${id}`] }
  );

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.internship;
}

export async function deleteInternship(id: string) {
  const res = await executeGqlFetch(DeleteInternshipDocument, { id });
  if (res.errors) {
    console.log(res.errors[0]);
    return { success: false, message: res.errors[0].message };
  }

  revalidateTag("internships");
  revalidateTag(`internship:${id}`);

  return { success: true, message: "success" };
}

export async function deleteIntern(id: string) {
  const res = await executeGqlFetch(DeleteInternDocument, { id });
  if (res.errors) {
    console.log(res.errors[0]);
    return { success: false, message: res.errors[0].message };
  }

  revalidateTag("internships");
  revalidateTag(`internship:${res.data.deleteIntern.data.internship}`);

  return { success: true, message: res.data.deleteIntern.message };
}

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

  revalidateTag(`internship:${res.data.updateInternFiles.data.internship}`);

  return { success: true, message: res.data.updateInternFiles.message };
}
