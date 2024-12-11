"use server";

import { InviteUsersDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";

export async function sendInvites(emails: string[]) {
  const res = await executeGqlFetch(InviteUsersDocument, { input: { emails } });
  if (res.errors) {
    console.log(res.errors[0]);
    return { success: false, message: res.errors[0].message };
  }

  return { success: true, message: res.data.inviteUsers };
}
