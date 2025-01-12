"use server";

import { PasswordResetDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import parseValidationErrors, { ErrorException } from "@/utils/parseErrors";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function resetPassword(password: string, token: string) {
  try {
    const res = await executeGqlFetch(
      PasswordResetDocument,
      { data: { password } },
      { resettoken: token },
      { revalidate: 60 * 60 }
    );

    if (res.errors) {
      const { validationErrors } = res.errors[0].extensions as ErrorException;

      throw new Error(
        validationErrors
          ? Object.values(parseValidationErrors(validationErrors)).join(" ")
          : res.errors[0].message
      );
    } else {
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      cookies().set("accessToken", res.data.passwordReset.data.token, {
        httpOnly: true,
        expires, //accesstoken expires in 24 hours
        // secure: process.env.NODE_ENV !== "development",
        // domain:
        //   process.env.NODE_ENV === "development"
        //     ? "localhost"
        //     : "flaw.uniba.sk",
      });
    }
  } catch (error: any) {
    return { success: false, message: error.message as string };
  }

  redirect("/");
}
