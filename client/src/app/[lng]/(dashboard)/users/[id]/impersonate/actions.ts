"use server";

import { ImpersonateDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import { redirect } from "next/dist/server/api-utils";
import { cookies } from "next/headers";

export async function impersonate(id: string) {
  try {
    const res = await executeGqlFetch(
      ImpersonateDocument,
      { id },
      null,
      undefined,
      "no-cache"
    );
    if (res.errors) {
      console.log(res.errors[0]);
      throw new Error(res.errors[0].message);
    }
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    cookies().set("user", res.data.user.id, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    cookies().set("accessToken", res.data.user.token, {
      httpOnly: true,
      expires, //accesstoken expires in 24 hours
    });
    return { success: true, message: "Welcome!" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
