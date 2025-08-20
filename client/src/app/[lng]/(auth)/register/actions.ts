"use server";

import {
  RegisterDocument,
  RegisterUserInput,
  UpdateUserDocument,
  UserInput,
} from "@/lib/graphql/generated/graphql";
import { executeGqlMutation } from "@/utils/actions";
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";

export async function register({
  url,
  token,
  ...data
}: RegisterUserInput & { url?: string; token?: string }) {
  const res = await executeGqlMutation(
    RegisterDocument,
    { data },
    (data) => ({ message: data.register.message, data: data.register.data }),
    {},
    { token }
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

export async function addUser(data: RegisterUserInput) {
  return await executeGqlMutation(
    RegisterDocument,
    { data },
    (data) => ({
      message: data.register.message,
      data: data.register.data,
    }),
    { revalidateTags: () => ["users"] }
  );
}

export async function updateUser(id: string, data: UserInput) {
  const cookieStore = await cookies();
  const user = cookieStore.get("user")?.value || "me";

  return await executeGqlMutation(
    UpdateUserDocument,
    {
      id,
      data,
    },
    (data) => ({
      message: data.updateUser.message,
      data: data.updateUser.data,
    }),
    {
      revalidateTags: (data) => [
        "users",
        `user:${data.updateUser.data.id}`,
        user,
      ],
      revalidatePaths: () => ["/profile", "/"],
    }
  );
}
