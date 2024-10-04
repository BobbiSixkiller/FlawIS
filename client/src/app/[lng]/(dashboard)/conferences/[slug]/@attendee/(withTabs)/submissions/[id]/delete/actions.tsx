"use server";

import { DeleteSubmissionDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function deleteSubmission(id: string) {
  try {
    const user = cookies().get("user")?.value;

    const res = await executeGqlFetch(DeleteSubmissionDocument, { id });
    if (res.errors) {
      throw new Error(res.errors[0].message);
    }

    revalidateTag(`conference:${user}`);
    return { success: true, message: res.data.deleteSubmission.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
