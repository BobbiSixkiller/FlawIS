"use server";

import { getMe } from "@/app/[lng]/(auth)/actions";
import { ImpersonateDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function impersonate(id: string) {
  const user = await getMe();
  if (!user) {
    redirect("/login");
  }

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
    revalidateTag(user.id);
    return { success: true, message: "Vitajte!" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
