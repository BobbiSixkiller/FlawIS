"use server";

import {
  InternsDocument,
  InternsQueryVariables,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";

export async function getInterns(vars: InternsQueryVariables) {
  const res = await executeGqlFetch(InternsDocument, vars);

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.interns;
}
