"use server";

import { GetDataFilter } from "@/components/withInfiniteScroll";
import { InternsDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";

export async function getInterns(filter: GetDataFilter) {
  const res = await executeGqlFetch(InternsDocument, filter);

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.interns;
}
