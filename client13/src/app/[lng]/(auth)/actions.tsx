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
        organization: input.organization,
      },
    });

    if (res.errors) {
      const { validationErrors } = res.errors[0].extensions
        .exception as ErrorException;

      return {
        success: false,
        message: validationErrors
          ? Object.values(parseErrors(validationErrors)).join(" ")
          : res.errors[0].message,
      };
    }
    if (res.data.register) {
      cookies().set("accessToken", res.data.register.data.token, {
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), //accesstoken expires in 24 hours
      });
    }
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }

  revalidateTag("me");
  redirect(formData.get("url")?.toString() || "/conferences");
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
      const { validationErrors } = res.errors[0].extensions
        .exception as ErrorException;

      return {
        success: false,
        message: validationErrors
          ? Object.values(parseErrors(validationErrors)).join(" ")
          : res.errors[0].message,
      };
    }
    if (res.data.login) {
      cookies().set("accessToken", res.data.login.token, {
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), //accesstoken expires in 24 hours
      });
    }
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }

  revalidateTag("me");
  redirect(formData.get("url")?.toString() || "/conferences");
}

export async function getMe() {
  const token = cookies().get("accessToken")?.value;
  if (!token) return;

  const res = await executeGqlFetch(
    MeDocument,
    undefined,
    {},
    { revalidate: 60 * 60, tags: ["me"] } //keep logged in user cached for an hour
  );

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data?.me;
}

export async function logout() {
  cookies().delete("accessToken");
  revalidateTag("me");
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
      const { validationErrors } = res.errors[0].extensions
        .exception as ErrorException;

      return {
        success: false,
        message: validationErrors
          ? Object.values(parseErrors(validationErrors)).join(" ")
          : res.errors[0].message,
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

    if (res.errors) {
      const { validationErrors } = res.errors[0].extensions
        .exception as ErrorException;

      return {
        success: false,
        message: validationErrors
          ? Object.values(parseErrors(validationErrors)).join(" ")
          : res.errors[0].message,
      };
    } else {
      cookies().set("accessToken", res.data.passwordReset.data.token, {
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), //accesstoken expires in 24 hours
      });
    }
  } catch (error: any) {
    return { success: false, message: error.message as string };
  }
  revalidateTag("me");
  redirect("/conferences");
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
    const { validationErrors } = res.errors[0].extensions
      .exception as ErrorException;

    console.log(res.errors);

    return {
      success: false,
      message: validationErrors
        ? Object.values(parseErrors(validationErrors)).join(" ")
        : res.errors[0].message,
    };
  }

  cookies().delete("activationToken");
  revalidateTag("me");
  return { success: true, message: res.data.activateUser };
}

export async function resendActivationLink() {
  const res = await executeGqlFetch(
    ResendActivationLinkDocument,
    {},
    {},
    { revalidate: 60 * 15 }
  );
  if (res.errors) {
    const { validationErrors } = res.errors[0].extensions
      .exception as ErrorException;

    return {
      success: false,
      message: validationErrors
        ? Object.values(parseErrors(validationErrors)).join(" ")
        : res.errors[0].message,
    };
  }
  return { success: true, message: res.data.resendActivationLink };
}

export async function updateProfile(prevState: any, formData: FormData) {
  const { profileInputSchema } = await validation();

  try {
    const input = await profileInputSchema.validate({
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
        organization: input.organization,
        telephone: input.telephone,
      },
    });
    if (res.errors) {
      const { validationErrors } = res.errors[0].extensions
        .exception as ErrorException;

      return {
        success: false,
        message: validationErrors
          ? Object.values(parseErrors(validationErrors)).join(" ")
          : res.errors[0].message,
      };
    }
    revalidateTag("me");
    return { success: true, message: res.data.updateUser.message };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}
