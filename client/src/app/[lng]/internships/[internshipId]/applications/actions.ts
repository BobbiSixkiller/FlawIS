"use server";

import {
  InternsDocument,
  InternsQueryVariables,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/lib/graphql/actions";

export async function getInterns(vars: InternsQueryVariables) {
  const res = await executeGqlFetch(
    InternsDocument,
    vars,
    null,
    undefined,
    "no-store",
  );

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.interns;
}
