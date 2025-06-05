"use server";

import { GetDataFilter } from "@/components/withInfiniteScroll";
import {
  InviteUsersDocument,
  TextSearchUserDocument,
  UserDocument,
  UsersDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";

export async function getUsers(filter: GetDataFilter) {
  //   await new Promise((resolve) => setTimeout(resolve, 5000));
  const res = await executeGqlFetch(
    UsersDocument,
    { ...filter },
    {},
    { tags: ["users"], revalidate: 3600 }
  );

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return (
    res.data?.users || {
      edges: [],
      totalCount: 0,
      pageInfo: { hasNextPage: false, endCursor: null },
    }
  );
}

export async function searchUser(params: { text: string }) {
  const res = await executeGqlFetch(TextSearchUserDocument, params);

  return res.data.textSearchUser || [];
}

export async function sendInvites(emails: string[]) {
  const res = await executeGqlFetch(InviteUsersDocument, { input: { emails } });
  if (res.errors) {
    console.log(res.errors[0]);
    return { success: false, message: res.errors[0].message };
  }

  return { success: true, message: res.data.inviteUsers };
}
