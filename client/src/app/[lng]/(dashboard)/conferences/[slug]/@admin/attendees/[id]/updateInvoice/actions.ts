"use server";

import {
  InvoiceInput,
  UpdateInvoiceDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import parseValidationErrors, { ErrorException } from "@/utils/parseErrors";
import { revalidateTag } from "next/cache";

export async function updateInvoice(id: string, data: InvoiceInput) {
  try {
    const res = await executeGqlFetch(UpdateInvoiceDocument, {
      id,
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

    revalidateTag(`conference:${res.data.updateInvoice.data.user.id}`);
    return { success: true, message: res.data.updateInvoice.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
