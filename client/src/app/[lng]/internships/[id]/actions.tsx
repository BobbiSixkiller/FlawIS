"use server";

import { InternshipDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";

export async function getInternship(id: string) {
  //   await new Promise((resolve) => setTimeout(resolve, 5000));
  const res = await executeGqlFetch(
    InternshipDocument,
    { id },
    {},
    { revalidate: 3600 }
  );

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.internship;
}
