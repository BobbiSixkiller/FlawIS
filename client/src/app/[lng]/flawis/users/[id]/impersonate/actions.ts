"use server";

import { Access, ImpersonateDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
