"use server";

import {
  ConferenceDocument,
  ConferencesDocument,
  ConferencesQueryVariables,
  CreateConferenceDocument,
  CreateConferenceMutationVariables,
} from "@/lib/graphql/generated/graphql";
import { notFound } from "next/navigation";
import { executeGqlFetch, executeGqlMutation } from "@/utils/actions";

export async function getConferences(vars: ConferencesQueryVariables) {
  const res = await executeGqlFetch(
    ConferencesDocument,
    vars,
    {},
    { tags: ["conferences"], revalidate: 3600 }
  );

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.conferences;
}

export async function getConference(slug: string) {
  const res = await executeGqlFetch(
    ConferenceDocument,
    { slug },
    {}
    // commented because of error triggered by a acceptAuthorInvite called inside conference register page server component
    // {
    //   tags: [`conferences:${slug}`],
    //   revalidate: 3600,
    // }
  );

  if (res.errors) {
    console.log(res.errors[0]);
    return notFound();
  }

  return res.data?.conference;
}

export async function createConference(
  vars: CreateConferenceMutationVariables
) {
  return await executeGqlMutation(
    CreateConferenceDocument,
    vars,
    (data) => ({ message: data.createConference.message }),
    { revalidateTags: () => ["conferences"] }
  );
}
