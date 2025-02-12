"use server";

import {
  InternDocument,
  UpdateOrgFeedbackDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import { revalidateTag } from "next/cache";
import { notFound } from "next/navigation";

export async function updateOrgFeedback(id: string, fileUrl: string | null) {
  const res = await executeGqlFetch(UpdateOrgFeedbackDocument, { id, fileUrl });
  if (res.errors) {
    console.log(res.errors[0].message);

    return { success: false, message: res.errors[0].message };
  }

  revalidateTag(`internship:${res.data.updateOrgFeedback.data.internship}`);

  return { success: true, message: res.data.updateOrgFeedback.message };
}

export async function getIntern(id: string) {
  const res = await executeGqlFetch(InternDocument, { id });
  if (res.errors) {
    console.log(res.errors[0]);

    return notFound();
  }

  return res.data.intern;
}
