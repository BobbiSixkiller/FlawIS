"use server";

import {
  CreateTicketDocument,
  CreateTicketMutationVariables,
  DeleteTicketDocument,
  DeleteTicketMutationVariables,
  UpdateTicketDocument,
  UpdateTicketMutationVariables,
} from "@/lib/graphql/generated/graphql";
import { executeGqlMutation } from "@/utils/actions";

export async function createTicket(vars: CreateTicketMutationVariables) {
  return await executeGqlMutation(
    CreateTicketDocument,
    vars,
    (data) => ({
      message: data.createTicket.message,
    }),
    { revalidateTags: () => [`conference:${vars.slug}`] }
  );
}

export async function updateTicket(vars: UpdateTicketMutationVariables) {
  return await executeGqlMutation(
    UpdateTicketDocument,
    vars,
    (data) => ({
      message: data.updateTicket.message,
    }),
    { revalidateTags: () => [`conference:${vars.slug}`] }
  );
}

export async function deleteTicket(vars: DeleteTicketMutationVariables) {
  return await executeGqlMutation(
    DeleteTicketDocument,
    vars,
    (data) => ({
      message: data.deleteTicket.message,
    }),
    { revalidateTags: (data) => [`conference:${vars.slug}`] }
  );
}
