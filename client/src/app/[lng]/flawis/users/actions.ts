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

export async function getUser(id: string) {
  const res = await executeGqlFetch(
    UserDocument,
    { id },
    {},
    {
      tags: [`user:${id}`],
      revalidate: 3600,
    }
  );
  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.user;
}

export async function searchUser(params: { text: string }) {
  const res = await executeGqlFetch(TextSearchUserDocument, params);

  return res.data.textSearchUser || [];
}
