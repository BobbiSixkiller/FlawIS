"use server";

import {
  DatesInput,
  DeleteConferenceDocument,
  DeleteConferenceMutationVariables,
  UpdateConferenceDatesDocument,
  UpdateConferenceDatesMutationVariables,
} from "@/lib/graphql/generated/graphql";
import { deleteFiles } from "@/lib/minio";
import { executeGqlMutation } from "@/utils/actions";

export async function deleteConference(
  vars: DeleteConferenceMutationVariables
) {
  const res = await executeGqlMutation(
    DeleteConferenceDocument,
    vars,
    (data) => ({
      message: data.deleteConference.message,
      data: data.deleteConference.data,
    }),
    {
      revalidateTags: (data) => [
        "conferences",
        `conference:${data.deleteConference.data.slug}`,
      ],
    }
  );
  if (res.data) {
    await deleteFiles([
      res.data.translations.sk.logoUrl,
      res.data.translations.sk.logoUrl,
    ]);
  }
  return res;
}

export async function updateConferenceDates(
  vars: UpdateConferenceDatesMutationVariables
) {
  return await executeGqlMutation(
    UpdateConferenceDatesDocument,
    vars,
    (data) => ({
      message: data.updateConferenceDates.message,
      data: data.updateConferenceDates.data,
    }),
    {
      revalidateTags: (data) => [
        "conferences",
        `conference:${data.updateConferenceDates.data.slug}`,
      ],
    }
  );
}
