"use server";

import {
  InviteUsersDocument,
  InviteUsersMutationVariables,
  TextSearchUserDocument,
  UsersDocument,
  UsersQueryVariables,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch, executeGqlMutation } from "@/utils/actions";

export async function getUsers(vars: UsersQueryVariables) {
  const res = await executeGqlFetch(
    UsersDocument,
    vars,
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

export async function sendInvites(vars: InviteUsersMutationVariables) {
  return await executeGqlMutation(InviteUsersDocument, vars, (data) => ({
    message: data.inviteUsers,
  }));
}
