"use server";

import {
  CreateInternshipDocument,
  InternshipInput,
  UpdateInternshipDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import { revalidateTag } from "next/cache";

export async function createInternship(input: InternshipInput) {
  const res = await executeGqlFetch(CreateInternshipDocument, { input });
  if (res.errors) {
    console.log(res.errors[0]);
    return { success: false, message: res.errors[0].message };
  }

  revalidateTag("internships");
  return { success: true, message: res.data.createInternship.message };
}

export async function updateInternship({
  id,
  input,
}: {
  id: string;
  input: InternshipInput;
}) {
  const res = await executeGqlFetch(UpdateInternshipDocument, { id, input });
  if (res.errors) {
    console.log(res.errors[0]);
    return { success: false, message: res.errors[0].message };
  }

  revalidateTag("internships");
  revalidateTag(`internship:${id}`);
  return { success: true, message: res.data.updateInternship.message };
}
