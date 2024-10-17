"use server";

import { UpdateUserDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch, validation } from "@/utils/actions";
import parseValidationErrors, { ErrorException } from "@/utils/parseErrors";
import { revalidateTag } from "next/cache";

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
      const { validationErrors } = res.errors[0].extensions as ErrorException;

      return {
        success: false,
        message: validationErrors
          ? Object.values(parseValidationErrors(validationErrors)).join(" ")
          : res.errors[0].message,
      };
    }
    revalidateTag(res.data.updateUser.data.id);
    return { success: true, message: res.data.updateUser.message };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}
