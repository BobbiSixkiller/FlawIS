"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ActivateUserDocument,
  MeDocument,
  ResendActivationLinkDocument,
} from "@/lib/graphql/generated/graphql";

import { OAuth2Client } from "google-auth-library";
import { executeGqlFetch, executeGqlMutation } from "@/utils/actions";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function getGoogleAuthLink(url?: string) {
  const authUrl = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    state: JSON.stringify({ redirectUrl: url }),
  });

  redirect(authUrl);
}

export async function getMe() {
  const cookieStore = await cookies();
  const user = cookieStore.get("user")?.value || "me";

  const res = await executeGqlFetch(
    MeDocument,
    undefined,
    {},
    { revalidate: 60 * 60, tags: [user] }
  );

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
    { revalidateTags: (data) => [data.activateUser.data.email] },
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
