"use server";

import {
  ChangeInternStatusDocument,
  ChangeInternStatusMutationVariables,
} from "@/lib/graphql/generated/graphql";
import { executeGqlMutation } from "@/utils/actions";

export async function changeInternStatus(
  params: ChangeInternStatusMutationVariables
) {
  return await executeGqlMutation(
    ChangeInternStatusDocument,
    params,
    (data) => ({
      message: data.changeInternStatus.message,
      data: data.changeInternStatus.data,
    }),
    {
      revalidateTags: (data) => [
        `internship:${data.changeInternStatus.data.internship}`,
      ],
    }
  );
}
