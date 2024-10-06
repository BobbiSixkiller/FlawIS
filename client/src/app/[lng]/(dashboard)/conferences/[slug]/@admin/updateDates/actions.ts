"use server";

import {
  DatesInput,
  UpdateConferenceDatesDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import parseValidationErrors, { ErrorException } from "@/utils/parseErrors";
import { revalidateTag } from "next/cache";

export async function updateConferenceDates(slug: string, data: DatesInput) {
  try {
    const res = await executeGqlFetch(UpdateConferenceDatesDocument, {
      slug,
      data,
    });
    if (res.errors) {
      const { validationErrors } = res.errors[0].extensions as ErrorException;

      throw new Error(
        validationErrors
          ? Object.values(parseValidationErrors(validationErrors)).join(" ")
          : res.errors[0].message
      );
    }

    revalidateTag("conferences");
    revalidateTag(`conference:${res.data.updateConferenceDates.data.slug}`);
    return { success: true, message: res.data.updateConferenceDates.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
