"use server";

import {
  ChangeInternStatusDocument,
  ChangeInternStatusMutationVariables,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import { revalidateTag } from "next/cache";

export async function changeInternStatus(
  params: ChangeInternStatusMutationVariables
) {
  const res = await executeGqlFetch(ChangeInternStatusDocument, params);
  if (res.errors) {
    console.log(res.errors[0]);
    return { success: false, message: res.errors[0].message };
  }

  revalidateTag(`internship:${res.data.changeInternStatus.data.internship}`);

  return { success: true, message: res.data.changeInternStatus.message };
}
