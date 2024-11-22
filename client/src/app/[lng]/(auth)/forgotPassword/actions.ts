"use server";

import { ForgotPasswordDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import parseValidationErrors, { ErrorException } from "@/utils/parseErrors";

export async function sendResetLink(prevState: any, formData: FormData) {
  try {
    const res = await executeGqlFetch(
      ForgotPasswordDocument,
      { email: formData.get("email")?.toString() || "" },
      {},
      { revalidate: 60 * 60 }
    );

    if (res.errors) {
      const { validationErrors } = res.errors[0].extensions as ErrorException;

      return {
        success: false,
        message: validationErrors
          ? Object.values(parseValidationErrors(validationErrors)).join(" ")
          : res.errors[0].message,
      };
    } else {
      return { success: true, message: res.data.forgotPassword };
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
