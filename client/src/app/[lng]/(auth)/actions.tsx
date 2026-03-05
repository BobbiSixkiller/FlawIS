"use server";

import { cookies } from "next/headers";

import {
  ActivateUserDocument,
  MeDocument,
  ResendActivationLinkDocument,
} from "@/lib/graphql/generated/graphql";

import { executeGqlFetch, executeGqlMutation } from "@/utils/actions";

export async function getMe() {
  const res = await executeGqlFetch(MeDocument);

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.me;
}

export async function activate() {
  const cookieStore = await cookies();
  const token = cookieStore.get("activationToken")?.value;
  if (!token) {
    return;
  }

  const res = await executeGqlMutation(
    ActivateUserDocument,
    {},
    (data) => ({
      message: data.activateUser.message,
      data: data.activateUser.data,
    }),
    {},
    {
      activation: token,
    }
  );

  cookieStore.delete("activationToken");
  return res;
}

export async function resendActivationLink() {
  return await executeGqlMutation(
    ResendActivationLinkDocument,
    {},
    (data) => ({ message: data.resendActivationLink }),
    undefined,
    undefined,
    { revalidate: 15 * 60 }
  );
}
