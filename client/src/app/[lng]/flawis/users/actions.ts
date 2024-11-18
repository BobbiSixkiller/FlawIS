"use server";

import { GetDataFilter } from "@/components/withInfiniteScroll";
import {
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
    { tags: ["users"] }
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

export async function getUser(id: string) {
  const res = await executeGqlFetch(UserDocument, { id }, null, {
    tags: [`user:${id}`],
  });
  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.user;
}

export async function searchUser(text: string) {
  const res = await executeGqlFetch(
    TextSearchUserDocument,
    { text },
    {},
    { revalidate: 3600 }
  );

  return res.data.textSearchUser || [];
}
