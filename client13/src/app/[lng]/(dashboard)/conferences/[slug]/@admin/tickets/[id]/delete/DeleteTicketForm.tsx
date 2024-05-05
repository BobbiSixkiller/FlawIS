"use client";

import { useContext } from "react";
import { TicketFragment } from "@/lib/graphql/generated/graphql";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import Button from "@/components/Button";
import { useParams, useRouter } from "next/navigation";
import { deleteTicket } from "../../actions";

export default function DeleteTicketForm({
  ticket,
  lng,
}: {
  ticket?: TicketFragment;
  lng: string;
}) {
  const router = useRouter();
  const { slug } = useParams();

  const { dispatch } = useContext(MessageContext);

  return (
    <form
      className="space-y-6 text-center"
      action={async (data) => {
        const state = await deleteTicket(null, data);

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
      <input type="hidden" name="ticketId" defaultValue={ticket?.id} />
      <input type="hidden" name="slug" defaultValue={slug} />

      <h1>
        Naozaj chcete zmazat formu ucasti{" "}
        {ticket?.translations[lng as "sk" | "en"]?.name} ?
      </h1>

      <Button color="primary" type="submit" fluid>
        Potvrdit
      </Button>
    </form>
  );
}
