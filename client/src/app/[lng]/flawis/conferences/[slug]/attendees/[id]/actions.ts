"use server";

import {
  AttendeeDocument,
  RemoveAuthorDocument,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import { revalidatePath } from "next/cache";

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
