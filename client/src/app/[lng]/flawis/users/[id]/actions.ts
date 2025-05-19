"use server";

import { ToggleVerifiedUserDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import { revalidateTag } from "next/cache";

export async function toggleVerified(id: string, verified: boolean) {
  const res = await executeGqlFetch(ToggleVerifiedUserDocument, {
    id,
    verified,
  });
  if (res.errors) {
    return { success: false, message: res.errors[0].message };
  }

  revalidateTag("users");
  revalidateTag(`user:${id}`);
  revalidateTag(res.data.toggleVerifiedUser.data.id);
  return { success: true, message: res.data.toggleVerifiedUser.message };
}
