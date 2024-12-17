"use server";

import { DeleteInternshipDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import { revalidatePath } from "next/cache";

export async function deleteInternship(id: string) {
  const res = await executeGqlFetch(DeleteInternshipDocument, { id });
  if (res.errors) {
    console.log(res.errors[0]);
    return { success: false, message: res.errors[0].message };
  }

  revalidatePath("/");

  return { success: true };
}
