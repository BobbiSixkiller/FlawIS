"use client";

import { ConferenceFragment } from "@/lib/graphql/generated/graphql";
import Button from "@/components/Button";
import { deleteConference } from "./actions";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import { useTransition } from "react";
import Spinner from "@/components/Spinner";
import { useParams } from "next/navigation";

export default function DeleteConferenceForm({
  conference,
  dialogId,
}: {
  dialogId: string;
  conference?: ConferenceFragment;
}) {
  const { lng } = useParams<{ lng: string }>();
  const [pending, startTransition] = useTransition();
  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  return (
    <form
      className="space-y-6 w-full sm:w-96"
      action={() =>
        startTransition(async () => {
          const res = await deleteConference(conference?.id);

          setMessage(res.message, res.success);

          if (res.success) {
            closeDialog(dialogId);
          }
        })
      }
    >
      <h1>
        Naozaj chcete zmazat konferenciu{" "}
        {conference?.translations[lng as "sk" | "en"].name} ?
      </h1>

      <Button
        disabled={pending}
        color="primary"
        type="submit"
        className="w-full"
      >
        {pending ? <Spinner inverted /> : "Potvrdit"}
      </Button>
    </form>
  );
}
