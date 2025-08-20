"use server";

import {
  AttendeeDocument,
  DeleteAttendeeDocument,
  RemoveAuthorDocument,
  RemoveAuthorMutationVariables,
  UpdateInvoiceDocument,
  UpdateInvoiceMutationVariables,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch, executeGqlMutation } from "@/utils/actions";

export async function removeAuthor(vars: RemoveAuthorMutationVariables) {
  return await executeGqlMutation(
    RemoveAuthorDocument,
    vars,
    (data) => ({
      message: data.removeAuthor.message,
      data: data.removeAuthor.data,
    }),
    {
      revalidatePaths: (data) => [
        `/conferences/${data.removeAuthor.data.conference.slug}/submissions`,
      ],
    }
  );
}

export async function getAttendee(id: string) {
  const res = await executeGqlFetch(
    AttendeeDocument,
    { id },
    {},
    { tags: [`attendees:${id}`] }
  );
  if (res.errors) {
    console.log(res.errors[0]);
    // return notFound();
  }

  return res.data?.attendee;
}

export async function deleteAttendee(id: string) {
  return await executeGqlMutation(
    DeleteAttendeeDocument,
    { id },
    (data) => ({
      message: data.deleteAttendee.message,
      data: data.deleteAttendee.data,
    }),
    { revalidateTags: () => ["attendees"] }
  );
}

export async function updateInvoice(vars: UpdateInvoiceMutationVariables) {
  return await executeGqlMutation(
    UpdateInvoiceDocument,
    vars,
    (data) => ({
      message: data.updateInvoice.message,
      data: data.updateInvoice.data,
    }),
    {
      revalidateTags: (data) => [
        `conferences:${data.updateInvoice.data.conference.slug}`,
        `attendees:${vars.id}`,
      ],
    }
  );
}
