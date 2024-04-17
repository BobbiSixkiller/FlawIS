"use server";

import {
  CreateTicketDocument,
  DeleteTicketDocument,
  TicketInput,
  UpdateTicketDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import parseValidationErrors, { ErrorException } from "@/utils/parseErrors";
import { revalidateTag } from "next/cache";

export async function createTicket(data: TicketInput, conferenceSlug: string) {
  try {
    const res = await executeGqlFetch(CreateTicketDocument, {
      slug: conferenceSlug,
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

    revalidateTag(`conference:${conferenceSlug}`);
    return { success: true, message: res.data.createTicket.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateTicket(
  data: TicketInput,
  conferenceSlug: string,
  ticketId: string
) {
  try {
    const res = await executeGqlFetch(UpdateTicketDocument, {
      data,
      ticketId,
      slug: conferenceSlug,
    });

    if (res.errors) {
      const { validationErrors } = res.errors[0].extensions as ErrorException;

      throw new Error(
        validationErrors
          ? Object.values(parseValidationErrors(validationErrors)).join(" ")
          : res.errors[0].message
      );
    }

    revalidateTag(`conference:${conferenceSlug}`);
    return { success: true, message: res.data.updateTicket.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteTicket(prevState: any, data: FormData) {
  try {
    const res = await executeGqlFetch(DeleteTicketDocument, {
      slug: data.get("slug")?.toString() || "",
      ticketId: data.get("ticketId")?.toString() || "",
    });
    if (res.errors) {
      throw new Error(res.errors[0].message);
    }

    revalidateTag(`conference:${data.get("slug")?.toString()}`);
    return { success: true, message: res.data.deleteTicket };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
