"use server";

import {
  RegisterDocument,
  Role,
  TextSearchUserDocument,
  ToggleVerifiedUserDocument,
  UpdateUserDocument,
  UserDocument,
  UsersDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch, validation } from "@/utils/actions";
import parseValidationErrors, { ErrorException } from "@/utils/parseErrors";
import { revalidateTag } from "next/cache";

export async function getUsers(after?: string, first?: number) {
  //   await new Promise((resolve) => setTimeout(resolve, 5000));
  const res = await executeGqlFetch(
    UsersDocument,
    { after, first },
    {},
    { tags: ["users"] }
  );

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data.users;
}

export async function getUser(id: string) {
  const res = await executeGqlFetch(
    UserDocument,
    { id },
    {},
    { tags: [`user:${id}`] }
  );
  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.user;
}

export async function addUser(prevState: any, formData: FormData) {
  const { registerInputSchema } = await validation();
  try {
    const input = await registerInputSchema.validate({
      name: formData.get("name")?.toString(),
      email: formData.get("email")?.toString(),
      password: formData.get("password")?.toString(),
      confirmPassword: formData.get("confirmPassword")?.toString(),
      organization: formData.get("organization")?.toString(),
      telephone: formData.get("telephone")?.toString(),
      privacy: true,
    });

    const res = await executeGqlFetch(RegisterDocument, {
      data: {
        email: input.email,
        name: input.name,
        password: input.password,
        telephone: input.telephone,
        organization: input.organization,
      },
    });

    if (res.errors) {
      const { validationErrors } = res.errors[0].extensions
        .exception as ErrorException;

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
    console.log(error);
    return { success: false, message: error.message };
  }
}

export async function updateUser(prevState: any, formData: FormData) {
  const { userInputSchema } = await validation();
  try {
    const input = await userInputSchema.validate({
      id: formData.get("id")?.toString(),
      name: formData.get("name")?.toString(),
      email: formData.get("email")?.toString(),
      organization: formData.get("organization")?.toString(),
      telephone: formData.get("telephone")?.toString(),
      role: formData.get("role[value]")?.toString(),
    });

    const res = await executeGqlFetch(UpdateUserDocument, {
      id: input.id,
      data: {
        email: input.email,
        name: input.name,
        telephone: input.telephone,
        organization: input.organization,
        role: input.role as Role,
      },
    });

    if (res.errors) {
      const { validationErrors } = res.errors[0].extensions
        .exception as ErrorException;

      return {
        success: false,
        message: validationErrors
          ? Object.values(parseValidationErrors(validationErrors)).join(" ")
          : res.errors[0].message,
      };
    }
    revalidateTag("users");
    revalidateTag(`user:${input.id}`);
    return { success: true, message: res.data.updateUser.message };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}

export async function toggleVerified(id: string) {
  const res = await executeGqlFetch(ToggleVerifiedUserDocument, { id });
  if (res.errors) {
    return { success: false, message: res.errors[0].message };
  }

  revalidateTag("users");
  revalidateTag(`user:${id}`);
  return { success: true, message: res.data.toggleVerifiedUser.message };
}

export async function searchUser(text: string) {
  const res = await executeGqlFetch(
    TextSearchUserDocument,
    { text },
    {},
    { revalidate: 3600 }
  );
  if (res.errors) {
    return { success: false, message: res.errors[0].message };
  }

  return { success: true, data: res.data.textSearchUser };
}
