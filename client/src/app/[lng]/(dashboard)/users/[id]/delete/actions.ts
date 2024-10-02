"use server";

import { DeleteUserDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import { revalidateTag } from "next/cache";

export async function deleteUser(id: string) {
  try {
    const res = await executeGqlFetch(DeleteUserDocument, {
      id,
    });
    if (res.errors) {
      throw new Error(res.errors[0].message);
    }

    revalidateTag("users");
    revalidateTag(`user:${id}`);
    return { success: true, message: res.data.deleteUser.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
