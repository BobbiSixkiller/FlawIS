"use server";

import {
  RegisterDocument,
  RegisterUserInput,
  UpdateUserDocument,
  UserInput,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import parseValidationErrors, { ErrorException } from "@/utils/parseErrors";
import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function register({
  url,
  token,
  ...data
}: RegisterUserInput & { url?: string; token?: string }) {
  const res = await executeGqlFetch(RegisterDocument, { data }, { token });

  if (res.errors) {
    const { validationErrors } = res.errors[0].extensions as ErrorException;

    return {
      success: false,
      message: res.errors[0].message,
      errors: validationErrors
        ? parseValidationErrors(validationErrors)
        : undefined,
    };
  }

  if (res.data.register) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    cookies().set("user", res.data.register.data.email, {
      httpOnly: true,
      expires, //accesstoken expires in 24 hours
      secure: process.env.NODE_ENV !== "development",
      sameSite: "lax",
      path: "/", // make it available on every route
      domain:
        process.env.NODE_ENV === "development" ? "localhost" : ".flaw.uniba.sk",
    });
    cookies().set("accessToken", res.data.register.data.token, {
      httpOnly: true,
      expires, //accesstoken expires in 24 hours
      secure: process.env.NODE_ENV !== "development",
      sameSite: "lax",
      path: "/", // make it available on every route
      domain:
        process.env.NODE_ENV === "development" ? "localhost" : ".flaw.uniba.sk",
    });
  }

  redirect(url || "/");
}

export async function addUser(data: RegisterUserInput) {
  const res = await executeGqlFetch(RegisterDocument, { data });

  if (res.errors) {
    const { validationErrors } = res.errors[0].extensions as ErrorException;

    console.log(validationErrors);

    return {
      success: false,
      message: res.errors[0].message,
      errors: validationErrors
        ? parseValidationErrors(validationErrors)
        : undefined,
    };
  }

  revalidateTag("users");
  return {
    success: true,
    message: res.data.register.message,
  };
}

export async function updateUser(id: string, data: UserInput) {
  const res = await executeGqlFetch(UpdateUserDocument, {
    id,
    data,
  });
  if (res.errors) {
    const { validationErrors } = res.errors[0].extensions as ErrorException;

    return {
      success: false,
      message: res.errors[0].message,
      errors: validationErrors
        ? parseValidationErrors(validationErrors)
        : undefined,
    };
  }

  revalidateTag("users");
  revalidateTag(`user:${id}`);
  revalidatePath("/", "layout");
  return {
    success: true,
    message: res.data.updateUser.message,
  };
}
