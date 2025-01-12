"use server";

import { GetDataFilter } from "@/components/withInfiniteScroll";
import {
  InternDocument,
  InternsDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import { notFound } from "next/navigation";

export async function getInterns(filter: GetDataFilter) {
  const res = await executeGqlFetch(
    InternsDocument,
    filter,
    {},
    { tags: ["internships"], revalidate: 3600 }
  );

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.interns;
}

export async function getIntern(id: string) {
  const res = await executeGqlFetch(InternDocument, { id });
  if (res.errors) {
    console.log(res.errors[0]);

    return notFound();
  }

  return res.data.intern;
}
