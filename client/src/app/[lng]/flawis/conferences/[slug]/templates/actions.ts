"use server";
import { executeGqlFetch } from "@/lib/graphql/actions";
import {
  SetConferenceTemplateDocument,
  type SetConferenceTemplateMutationVariables,
} from "@/lib/graphql/generated/graphql";

export async function setConferenceTemplate(
  variables: SetConferenceTemplateMutationVariables,
) {
  const result = await executeGqlFetch(
    SetConferenceTemplateDocument,
    variables,
    null,
    undefined,
    "no-store",
  );
  if (result.errors?.length)
    return { ok: false as const, message: result.errors[0].message };
  return { ok: true as const };
}
