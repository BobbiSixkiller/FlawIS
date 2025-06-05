"use server";

import {
  Access,
  DeleteUserDocument,
  ImpersonateDocument,
  ToggleVerifiedUserDocument,
  UserDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getUser(id: string) {
  const res = await executeGqlFetch(
    UserDocument,
    { id },
    {},
    {
      tags: [`user:${id}`],
      revalidate: 3600,
    }
  );
  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.user;
}

export async function toggleVerified(id: string, verified: boolean) {
  const res = await executeGqlFetch(ToggleVerifiedUserDocument, {
    id,
    verified,
  });
  if (res.errors) {
    return { success: false, message: res.errors[0].message };
  }

  revalidateTag("users");
  revalidateTag(`user:${id}`);
  revalidateTag(res.data.toggleVerifiedUser.data.id);
  return { success: true, message: res.data.toggleVerifiedUser.message };
}

export async function deleteUser(id: string) {
  try {
    const res = await executeGqlFetch(DeleteUserDocument, {
      id,
    });
    if (res.errors) {
      throw new Error(res.errors[0].message);
    }

    revalidateTag("users");
    revalidateTag(`user:${id}`);
    return { success: true, message: res.data.deleteUser.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function impersonate(id: string) {
  const res = await executeGqlFetch(
    ImpersonateDocument,
    { id },
    null,
    undefined,
    "no-cache"
  );

  if (res.errors) {
    console.log(res.errors[0]);
    return { success: false, message: res.errors[0].message };
  }

  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  cookies().set("accessToken", res.data.user.token, {
    httpOnly: true,
    expires, //accesstoken expires in 24 hours
    secure: process.env.NODE_ENV !== "development",
    domain:
      process.env.NODE_ENV === "development" ? "localhost" : "flaw.uniba.sk",
  });

  if (process.env.NODE_ENV === "development") {
    redirect("/");
  }

  //check for staging env
  if (process.env.API_URI) {
    redirect(
      res.data.user.access.includes(Access.ConferenceAttendee)
        ? "https://conferences-staging.flaw.uniba.sk"
        : "https://internships-staging.flaw.uniba.sk"
    );
  } else {
    redirect(
      res.data.user.access.includes(Access.ConferenceAttendee)
        ? "https://conferences.flaw.uniba.sk"
        : "https://internships.flaw.uniba.sk"
    );
  }
}
