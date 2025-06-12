"use client";

import { TicketFragment } from "@/lib/graphql/generated/graphql";
import Button from "@/components/Button";
import { useParams } from "next/navigation";
import { deleteTicket } from "./actions";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";

export default function DeleteTicketForm({
  ticket,
  lng,
  dialogId,
}: {
  ticket?: TicketFragment;
  lng: string;
  dialogId: string;
}) {
  const { slug } = useParams();

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  return (
    <form
      className="space-y-6 text-center"
      action={async (data) => {
        const state = await deleteTicket(null, data);

        setMessage(state.message, state.success);

        if (state.success) {
          closeDialog(dialogId);
        }
      }}
    >
      <input type="hidden" name="ticketId" defaultValue={ticket?.id} />
      <input type="hidden" name="slug" defaultValue={slug} />

      <h1>
        Naozaj chcete zmazat formu ucasti{" "}
        {ticket?.translations[lng as "sk" | "en"]?.name} ?
      </h1>

      <Button color="primary" type="submit" className="w-full">
        Potvrdit
      </Button>
    </form>
  );
}
