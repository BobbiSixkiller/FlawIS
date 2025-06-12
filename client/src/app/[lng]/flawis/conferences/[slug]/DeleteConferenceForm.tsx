"use client";

import { ConferenceFragment } from "@/lib/graphql/generated/graphql";
import Button from "@/components/Button";
import { deleteConference } from "./actions";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";

export default function DeleteConferenceForm({
  lng,
  conference,
  dialogId,
}: {
  lng: string;
  dialogId: string;
  conference?: ConferenceFragment;
}) {
  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  return (
    <form
      className="space-y-6 w-full sm:w-96"
      action={async (data) => {
        const state = await deleteConference(null, data);

        setMessage(state.message, state.success);

        if (state.success) {
          closeDialog(dialogId);
        }
      }}
    >
      <input type="hidden" name="id" value={conference?.id} />

      <h1>
        Naozaj chcete zmazat konferenciu{" "}
        {conference?.translations[lng as "sk" | "en"].name} ?
      </h1>

      <Button color="primary" type="submit" className="w-full">
        Potvrdit
      </Button>
    </form>
  );
}
