"use client";

import { useTransition } from "react";
import { AttendeeFragment } from "@/lib/graphql/generated/graphql";
import Button from "@/components/Button";
import { deleteAttendee } from "./actions";
import { useDialogStore } from "@/stores/dialogStore";
import Spinner from "@/components/Spinner";
import { useMessageStore } from "@/stores/messageStore";

export default function DeleteAttendeeForm({
  attendee,
  dialogId,
}: {
  attendee: AttendeeFragment;
  lng: string;
  dialogId: string;
}) {
  const [pending, startTransition] = useTransition();

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  function handleClik() {
    startTransition(async () => {
      const state = await deleteAttendee(attendee.id);

      setMessage(state.message, state.success);

      if (state.success) {
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
