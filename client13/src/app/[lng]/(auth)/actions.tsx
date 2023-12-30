"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";

import {
  ActivateUserDocument,
  ForgotPasswordDocument,
  LoginDocument,
  MeDocument,
  PasswordResetDocument,
  RegisterDocument,
  ResendActivationLinkDocument,
  UpdateUserDocument,
} from "@/lib/graphql/generated/graphql";
import parseErrors, { ErrorException } from "@/utils/parseErrors";
import { executeGqlFetch, validation } from "@/utils/actions";

export async function register(prevState: any, formData: FormData) {
  const { registerInputSchema } = await validation();
  try {
    const input = await registerInputSchema.validate({
      name: formData.get("name")?.toString(),
      email: formData.get("email")?.toString(),
      password: formData.get("password")?.toString(),
      confirmPassword: formData.get("confirmPassword")?.toString(),
      organization: formData.get("organization")?.toString(),
      telephone: formData.get("telephone")?.toString(),
      privacy: formData.get("privacy")?.toString() === "on",
      url: formData.get("url")?.toString(),
    });

    const res = await executeGqlFetch(RegisterDocument, {
      data: {
        email: input.email,
        name: input.name,
        password: input.password,
        telephone: input.telephone,
        organisation: input.organization,
      },
    });

    if (res.errors) {
      const { message, validationErrors } = res.errors[0].extensions
        .exception as ErrorException;

      return {
        success: false,
        message: validationErrors
          ? Object.values(parseErrors(validationErrors)).join(" ")
          : message,
      };
    }
    if (res.data.register) {
      cookies().set("accessToken", res.data.register as string, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 60 * 1000 * 24),
      });
    }
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }

  revalidateTag("user");
  redirect(formData.get("url")?.toString() || "/");
}

export async function login(prevState: any, formData: FormData) {
  const { loginValidationSchema } = await validation();
  try {
    const input = await loginValidationSchema.validate({
      email: formData.get("email")?.toString(),
      password: formData.get("password")?.toString(),
      url: formData.get("url")?.toString(),
    });

    const res = await executeGqlFetch(LoginDocument, input);

    if (res.errors) {
      const { message, validationErrors } = res.errors[0].extensions
        .exception as ErrorException;

      return {
        success: false,
        message: validationErrors
          ? Object.values(parseErrors(validationErrors)).join(" ")
          : message,
      };
    }
    if (res.data.login) {
      cookies().set("accessToken", res.data.login as string, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 60 * 1000 * 24),
      });
    }
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }

  revalidateTag("user");
  redirect(formData.get("url")?.toString() || "/");
}

export async function getMe() {
  const token = cookies().get("accessToken")?.value;
  if (!token) return;

  const res = await executeGqlFetch(
    MeDocument,
    undefined,
    {},
    { revalidate: 60 * 60 * 24, tags: ["user"] } //keep logged in user cached for 24hours
  );

  if (res.errors) {
    const { message } = res.errors[0].extensions.exception as ErrorException;
    console.log(message);
  }

  return res.data?.me;
}

export async function logout() {
  cookies().delete("accessToken");
  revalidateTag("user");
  redirect("/");
}

export async function sendResetLink(prevState: any, formData: FormData) {
  const { forgotPasswordValidationSchema } = await validation();
  try {
    const input = await forgotPasswordValidationSchema.validate({
      email: formData.get("email")?.toString(),
    });

    const res = await executeGqlFetch(
      ForgotPasswordDocument,
      input,
      {},
      { revalidate: 60 * 60 }
    );

    if (res.errors) {
      const { message } = res.errors[0].extensions.exception as ErrorException;

      return {
        success: false,
        message: message || res.errors[0].extensions.code,
      };
    } else {
      return { success: true, message: res.data.forgotPassword };
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function resetPassword(prevState: any, formData: FormData) {
  const { resetPasswordValidationSchema } = await validation();
  try {
    const input = await resetPasswordValidationSchema.validate({
      password: formData.get("password")?.toString(),
      confirmPassword: formData.get("confirmPassword")?.toString(),
      token: formData.get("token")?.toString(),
    });

    const res = await executeGqlFetch(
      PasswordResetDocument,
      { data: { password: input.password } },
      { resettoken: input.token },
      { revalidate: 60 * 60 }
    );

    //pohrat sa s tym
    if (res.errors) {
      const { message } = res.errors[0].extensions.exception as ErrorException;

      return {
        success: false,
        message: message || res.errors[0].originalError?.message,
      };
    } else {
      cookies().set("accessToken", res.data.passwordReset as string, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 60 * 1000 * 24 * 7),
      });
    }
  } catch (error: any) {
    return { success: false, message: error.message as string };
  }

  revalidateTag("user");
  return { success: true, message: "SUCCESS" };
}

export async function activate() {
  const token = cookies().get("activationToken")?.value;
  if (!token) {
    return;
  }

  const res = await executeGqlFetch(
    ActivateUserDocument,
    undefined,
    {
      activation: token,
    },
    { revalidate: 60 * 60 }
  );

  if (res.errors) {
    const { message } = res.errors[0].extensions.exception as ErrorException;

    return {
      success: false,
      message: message || (res.errors[0].originalError?.message as string),
    };
  }

  cookies().delete("activationToken");
  revalidateTag("user");
  return { success: true, message: res.data.activateUser };
}

export async function resendActivationLink() {
  try {
    const res = await executeGqlFetch(
      ResendActivationLinkDocument,
      {},
      {},
      { revalidate: 60 * 15 }
    );
    if (res.errors) {
      const { message } = res.errors[0].extensions.exception as ErrorException;

      return {
        success: false,
        message: message || res.errors[0].extensions.code,
      };
    }
    return { success: true, message: res.data.resendActivationLink };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}
export async function updateProfile(prevState: any, formData: FormData) {
  const { updateProfileInputSchema } = await validation();

  try {
    const input = await updateProfileInputSchema.validate({
      id: formData.get("id")?.toString(),
      name: formData.get("name")?.toString(),
      email: formData.get("email")?.toString(),
      organization: formData.get("organization")?.toString(),
      telephone: formData.get("telephone")?.toString(),
    });

    const res = await executeGqlFetch(UpdateUserDocument, {
      id: input.id,
      data: {
        name: input.name,
        email: input.email,
        organisation: input.organization,
        telephone: input.telephone,
      },
    });
    if (res.errors) {
      const { message, validationErrors } = res.errors[0].extensions
        .exception as ErrorException;

      return {
        success: false,
        message: validationErrors
          ? Object.values(parseErrors(validationErrors)).join(" ")
          : message,
      };
    }
    revalidateTag("user");
    return { success: true, message: res.data.updateUser.message };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}
