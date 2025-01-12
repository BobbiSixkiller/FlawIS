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
  try {
    const res = await executeGqlFetch(RegisterDocument, { data }, { token });

    if (res.errors) {
      const { validationErrors } = res.errors[0].extensions as ErrorException;

      throw new Error(
        validationErrors
          ? Object.values(parseValidationErrors(validationErrors)).join(" ")
          : res.errors[0].message
      );
    }
    if (res.data.register) {
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      cookies().set("accessToken", res.data.register.data.token, {
        httpOnly: true,
        expires, //accesstoken expires in 24 hours
        secure: process.env.NODE_ENV !== "development",
        domain:
          process.env.NODE_ENV === "development"
            ? "localhost"
            : "flaw.uniba.sk",
      });

      revalidatePath("/");
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }

  redirect(url || "/");
}

export async function addUser(data: RegisterUserInput) {
  try {
    const res = await executeGqlFetch(RegisterDocument, { data });

    if (res.errors) {
      const { validationErrors } = res.errors[0].extensions as ErrorException;

      return {
        success: false,
        message: validationErrors
          ? Object.values(parseValidationErrors(validationErrors)).join(" ")
          : res.errors[0].message,
      };
    }
    revalidateTag("users");
    return { success: true, message: res.data.register.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateUser(id: string, data: UserInput) {
  try {
    const res = await executeGqlFetch(UpdateUserDocument, {
      id,
      data,
    });
    if (res.errors) {
      const { validationErrors } = res.errors[0].extensions as ErrorException;

      return {
        success: false,
        message: validationErrors
          ? Object.values(parseValidationErrors(validationErrors)).join(" ")
          : res.errors[0].message,
      };
    }

    revalidateTag("users");
    revalidateTag(`user:${id}`);
    revalidatePath("/", "layout");
    return { success: true, message: res.data.updateUser.message };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}
