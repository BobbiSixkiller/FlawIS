"use client";

import { TicketFragment } from "@/lib/graphql/generated/graphql";
import Button from "@/components/Button";
import { useParams } from "next/navigation";
import { deleteTicket } from "./actions";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import { useTransition } from "react";
import Spinner from "@/components/Spinner";

export default function DeleteTicketForm({
  ticket,
  lng,
  dialogId,
}: {
  ticket: TicketFragment;
  lng: string;
  dialogId: string;
}) {
  const { slug } = useParams<{ slug: string }>();

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-6 text-center"
      action={() =>
        startTransition(async () => {
          const res = await deleteTicket({ slug, ticketId: ticket?.id });

          setMessage(res.message, res.success);

          if (res.success) {
            closeDialog(dialogId);
          }
        })
      }
    >
      <h1>
        Naozaj chcete zmazat formu ucasti{" "}
        {ticket?.translations[lng as "sk" | "en"]?.name} ?
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
