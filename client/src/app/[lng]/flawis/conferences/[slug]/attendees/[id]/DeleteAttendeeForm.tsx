"use client";

import { useContext, useTransition } from "react";
import { AttendeeFragment } from "@/lib/graphql/generated/graphql";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import Button from "@/components/Button";
import { deleteAttendee } from "./actions";
import { useDialogStore } from "@/stores/dialogStore";
import Spinner from "@/components/Spinner";

export default function DeleteAttendeeForm({
  attendee,
  dialogId,
}: {
  attendee: AttendeeFragment;
  lng: string;
  dialogId: string;
}) {
  const [pending, startTransition] = useTransition();

  const { dispatch } = useContext(MessageContext);

  const { closeDialog } = useDialogStore();

  function handleClik() {
    startTransition(async () => {
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

        closeDialog(dialogId);
      }
    });
  }

  return (
    <div className="space-y-6">
      <h1>Naozaj chcete zmazat ucastnika {attendee.user.name}?</h1>

      <Button
        disabled={pending}
        onClick={handleClik}
        className="w-full"
        variant="destructive"
      >
        {pending ? <Spinner inverted /> : "Potvrdit"}
      </Button>
    </div>
  );
}
