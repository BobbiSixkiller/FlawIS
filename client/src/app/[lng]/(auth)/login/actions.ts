"use server";

import { LoginDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import parseValidationErrors, { ErrorException } from "@/utils/parseErrors";
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";

export async function login(email: string, password: string, url?: string) {
  try {
    const res = await executeGqlFetch(LoginDocument, { email, password });

    if (res.errors) {
      const { validationErrors } = res.errors[0].extensions as ErrorException;
      console.log(res.errors[0]);
      return {
        success: false,
        message: validationErrors
          ? Object.values(parseValidationErrors(validationErrors)).join(" ")
          : res.errors[0].message,
      };
    }
    if (res.data.login) {
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      cookies().set("accessToken", res.data.login.data.token, {
        httpOnly: true,
        expires, //accesstoken expires in 24 hours
        secure: process.env.NODE_ENV !== "development",
        sameSite: "lax",
        domain:
          process.env.NODE_ENV === "development"
            ? "localhost"
            : ".flaw.uniba.sk",
      });
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }

  console.log("REDIRECT URL ", url);

  redirect(url ? decodeURIComponent(url) : "/", RedirectType.replace);
}
