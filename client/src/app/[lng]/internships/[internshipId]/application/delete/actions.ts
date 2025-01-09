"use server";

import { DeleteInternDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import { revalidateTag } from "next/cache";

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
