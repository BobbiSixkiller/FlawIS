"use server";

import {
  InternDocument,
  UpdateOrgFeedbackDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch, executeGqlMutation } from "@/utils/actions";

export async function getIntern(id: string) {
  const res = await executeGqlFetch(InternDocument, { id });
  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.intern;
}

export async function updateOrgFeedback(id: string, fileUrl: string | null) {
  return await executeGqlMutation(
    UpdateOrgFeedbackDocument,
    { id, fileUrl },
    (data) => ({
      message: data.updateOrgFeedback.message,
      data: data.updateOrgFeedback.data,
    }),
    {
      revalidateTags: (data) => [
        `internship:${data.updateOrgFeedback.data.internship}`,
      ],
    }
  );
}
