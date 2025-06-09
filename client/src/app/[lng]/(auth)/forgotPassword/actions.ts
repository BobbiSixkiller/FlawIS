"use server";

import { ForgotPasswordDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlMutation } from "@/utils/actions";

export async function sendResetLink(email: string) {
  return await executeGqlMutation(
    ForgotPasswordDocument,
    { email },
    (data) => ({ message: data.forgotPassword }),
    undefined,
    undefined,
    { revalidate: 3600 }
  );
}
