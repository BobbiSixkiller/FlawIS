"use server";

import { LoginDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlMutation } from "@/utils/actions";
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";

export async function login(email: string, password: string, url?: string) {
  const res = await executeGqlMutation(
    LoginDocument,
    { email, password },
    (data) => ({ message: data.login.message, data: data.login.data })
  );

  if (res.data) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const cookieStore = await cookies();

    cookieStore.set("user", res.data.email, {
      httpOnly: true,
      expires, //accesstoken expires in 24 hours
      secure: process.env.NODE_ENV !== "development",
      sameSite: "lax",
      path: "/", // make it available on every route
      domain:
        process.env.NODE_ENV === "development" ? "localhost" : ".flaw.uniba.sk",
    });
    cookieStore.set("accessToken", res.data.token, {
      httpOnly: true,
      expires, //accesstoken expires in 24 hours
      secure: process.env.NODE_ENV !== "development",
      sameSite: "lax",
      path: "/", // make it available on every route
      domain:
        process.env.NODE_ENV === "development" ? "localhost" : ".flaw.uniba.sk",
    });

    redirect(url ? url : "/", RedirectType.replace);
  }

  return res;
}
