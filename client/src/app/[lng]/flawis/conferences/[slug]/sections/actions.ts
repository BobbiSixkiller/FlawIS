"use server";

import {
  ConferenceSectionsDocument,
  ConferenceSectionsQueryVariables,
  CreateSectionDocument,
  CreateSectionMutationVariables,
  DeleteSectionDocument,
  DeleteSectionMutationVariables,
  UpdateSectionDocument,
  UpdateSectionMutationVariables,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch, executeGqlMutation } from "@/utils/actions";

export async function conferenceSections(
  vars: ConferenceSectionsQueryVariables
) {
  const res = await executeGqlFetch(ConferenceSectionsDocument, vars);
  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.conference;
}

export async function createSection(vars: CreateSectionMutationVariables) {
  return await executeGqlMutation(
    CreateSectionDocument,
    vars,
    (data) => ({
      message: data.createSection.message,
      data: data.createSection.data,
    }),
    {
      revalidateTags: (data) => [
        `conferences:${data.createSection.data.conference?.slug}`,
      ],
    }
  );
}

export async function deleteSection(vars: DeleteSectionMutationVariables) {
  return await executeGqlMutation(
    DeleteSectionDocument,
    vars,
    (data) => ({
      message: data.deleteSection.message,
      data: data.deleteSection.data,
    }),
    {
      revalidateTags: (data) => [
        `conferences:${data.deleteSection.data.conference?.slug}`,
      ],
    }
  );
}

export async function updateSection(vars: UpdateSectionMutationVariables) {
  return await executeGqlMutation(
    UpdateSectionDocument,
    vars,
    (data) => ({
      message: data.updateSection.message,
      data: data.updateSection.data,
    }),
    {
      revalidateTags: (data) => [
        `conferences:${data.updateSection.data.conference?.slug}`,
      ],
    }
  );
}
