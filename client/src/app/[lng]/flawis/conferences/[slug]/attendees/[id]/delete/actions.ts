"use server";

import { DeleteAttendeeDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";
import { revalidateTag } from "next/cache";

export async function deleteAttendee(id: string) {
  try {
    const res = await executeGqlFetch(DeleteAttendeeDocument, {
      id,
    });
    if (res.errors) {
      console.log(res.errors[0]);
      throw new Error(res.errors[0].message);
    }

    console.log(res.data.deleteAttendee.data);

    revalidateTag("attendees");
    return { success: true, message: res.data.deleteAttendee.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
