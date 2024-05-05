"use server";

import { AttendeeDocument } from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";

export async function getAttendee(id: string) {
  const res = await executeGqlFetch(AttendeeDocument, { id });
  if (res.errors) {
    console.log(res.errors[0]);
    // return notFound();
  }

  return res.data?.attendee;
}
