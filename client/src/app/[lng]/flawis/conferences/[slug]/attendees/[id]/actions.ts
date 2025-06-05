"use server";

import {
  AttendeeDocument,
  DeleteAttendeeDocument,
  InvoiceInput,
  RemoveAuthorDocument,
  UpdateInvoiceDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import parseValidationErrors, { ErrorException } from "@/utils/parseErrors";
import { revalidatePath, revalidateTag } from "next/cache";

export async function removeAuthor(
  id: string,
  authorId: string,
  urlParams: { slug: string; id: string }
) {
  try {
    const res = await executeGqlFetch(RemoveAuthorDocument, { id, authorId });
    if (res.errors) {
      throw new Error(res.errors[0].message);
    }

    revalidatePath(`/conferences/${urlParams.slug}/attendees/${urlParams.id}`);

    return { success: true, message: res.data.removeAuthor.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getAttendee(id: string) {
  const res = await executeGqlFetch(AttendeeDocument, { id });
  if (res.errors) {
    console.log(res.errors[0]);
    // return notFound();
  }

  return res.data?.attendee;
}

export async function deleteAttendee(id: string) {
  const res = await executeGqlFetch(DeleteAttendeeDocument, {
    id,
  });
  if (res.errors) {
    console.log(res.errors[0]);
    return { success: false, message: res.errors[0].message };
  }

  revalidateTag("attendees");
  return { success: true, message: res.data.deleteAttendee.message };
}

export async function updateInvoice(id: string, data: InvoiceInput) {
  const res = await executeGqlFetch(UpdateInvoiceDocument, {
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

  revalidateTag(`conference:${res.data.updateInvoice.data.user.id}`);
  return { success: true, message: res.data.updateInvoice.message };
}
