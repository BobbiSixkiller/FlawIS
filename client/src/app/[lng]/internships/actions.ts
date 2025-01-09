"use server";

import { GetDataFilter } from "@/components/withInfiniteScroll";
import { InternshipsDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";

export async function getInternships(filter: GetDataFilter) {
  //   await new Promise((resolve) => setTimeout(resolve, 5000));
  const res = await executeGqlFetch(
    InternshipsDocument,
    { ...filter },
    {},
    { tags: ["internships"], revalidate: 3600 }
  );

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.internships;
}
