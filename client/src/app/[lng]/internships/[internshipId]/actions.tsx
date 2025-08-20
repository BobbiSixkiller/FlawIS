"use server";

import {
  CreateInternDocument,
  DeleteInternDocument,
  DeleteInternshipDocument,
  InternshipDocument,
  UpdateInternFilesDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch, executeGqlMutation } from "@/utils/actions";

export async function getInternship(id: string) {
  const res = await executeGqlFetch(
    InternshipDocument,
    { id },
    {},
    { revalidate: 3600, tags: [`internships:${id}`] }
  );

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.internship;
}

export async function deleteInternship(id: string) {
  return await executeGqlMutation(
    DeleteInternshipDocument,
    { id },
    (data) => ({
      message: data.deleteInternship.message,
      data: data.deleteInternship.data,
    }),
    { revalidateTags: () => ["internships", `internships:${id}`] }
  );
}

export async function deleteIntern(id: string) {
  return await executeGqlMutation(
    DeleteInternDocument,
    { id },
    (data) => ({
      message: data.deleteIntern.message,
      data: data.deleteIntern.data,
    }),
    {
      revalidateTags: (data) => [
        "internships",
        `internships:${data.deleteIntern.data.internship}`,
      ],
    }
  );
}

export async function createIntern(fileUrls: string[], internshipId: string) {
  return await executeGqlMutation(
    CreateInternDocument,
    {
      fileUrls,
      internshipId,
    },
    (data) => ({ message: data.createIntern.message }),
    { revalidateTags: () => ["internships", `internships:${internshipId}`] }
  );
}

export async function changeInternFiles(id: string, fileUrls: string[]) {
  return await executeGqlMutation(
    UpdateInternFilesDocument,
    {
      id,
      fileUrls,
    },
    (data) => ({
      message: data.updateInternFiles.message,
      data: data.updateInternFiles.data,
    }),
    {
      revalidateTags: (data) => [
        `internships:${data.updateInternFiles.data.internship}`,
      ],
    }
  );
}
