"use server";

import {
  CreateInternshipDocument,
  InternshipInput,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import { revalidatePath, revalidateTag } from "next/cache";

export async function createInternship(input: InternshipInput) {
  const res = await executeGqlFetch(CreateInternshipDocument, { input });
  if (res.errors) {
    console.log(res.errors[0]);
    return { success: false, message: res.errors[0].message };
  }

  revalidatePath("/internships");
  return { success: true, message: res.data.createInternship.message };
}
