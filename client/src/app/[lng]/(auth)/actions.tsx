"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";

import {
  ActivateUserDocument,
  MeDocument,
  ResendActivationLinkDocument,
} from "@/lib/graphql/generated/graphql";
import parseErrors, { ErrorException } from "@/utils/parseErrors";
import { executeGqlFetch } from "@/utils/actions";

import { OAuth2Client } from "google-auth-library";

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
  const user = cookies().get("user")?.value || "me";

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
  try {
    const token = cookies().get("activationToken")?.value;
    if (!token) {
      return;
    }

    const res = await executeGqlFetch(ActivateUserDocument, undefined, {
      activation: token,
    });

    if (res.errors) {
      console.log(res.errors[0]);
      throw new Error(res.errors[0].message);
    }

    cookies().delete("activationToken");
    revalidateTag(res.data.activateUser.data.email);

    return { success: true, message: res.data.activateUser.message };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function resendActivationLink() {
  const res = await executeGqlFetch(
    ResendActivationLinkDocument,
    {},
    {},
    { revalidate: 60 * 15 }
  );
  if (res.errors) {
    const { validationErrors } = res.errors[0].extensions
      .exception as ErrorException;

    return {
      success: false,
      message: validationErrors
        ? Object.values(parseErrors(validationErrors)).join(" ")
        : res.errors[0].message,
    };
  }
  return { success: true, message: res.data.resendActivationLink };
}
