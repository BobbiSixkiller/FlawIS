"use client";

import { useContext, useTransition } from "react";
import { AttendeeFragment } from "@/lib/graphql/generated/graphql";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import Button from "@/components/Button";
import { useParams, useRouter } from "next/navigation";
import { deleteAttendee } from "./actions";

export default function DeleteAttendeeForm({
  attendee,
  lng,
}: {
  attendee: AttendeeFragment;
  lng: string;
}) {
  const router = useRouter();

  const { dispatch } = useContext(MessageContext);

  return (
    <form
      className="space-y-6 text-center"
      action={async (data) => {
        const state = await deleteAttendee(attendee.id);

        if (state.message && !state.success) {
          dispatch({
            type: ActionTypes.SetFormMsg,
            payload: state,
          });
        }

        if (state.success) {
          dispatch({
            type: ActionTypes.SetAppMsg,
            payload: state,
          });
          router.back();
        }
      }}
    >
      <input type="hidden" name="id" defaultValue={attendee.id} />

      <h1>Naozaj chcete zmazat ucastnika {attendee.user.name}?</h1>

      <Button type="submit" className="w-full">
        Potvrdit
      </Button>
    </form>
  );
}
