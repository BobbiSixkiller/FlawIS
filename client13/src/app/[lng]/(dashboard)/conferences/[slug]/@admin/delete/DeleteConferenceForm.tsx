"use client";

import { ConferenceFragment } from "@/lib/graphql/generated/graphql";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { useContext } from "react";
import Button from "@/components/Button";
import { deleteConference } from "../../../actions";
import { useRouter } from "next/navigation";

export default function DeleteConferenceForm({
  lng,
  conference,
}: {
  lng: string;
  conference: ConferenceFragment;
}) {
  const router = useRouter();
  const { dispatch } = useContext(MessageContext);

  return (
    <form
      className="space-y-6 w-full sm:w-96"
      action={async (data) => {
        const state = await deleteConference(null, data);

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
      <input type="hidden" name="id" value={conference.id} />

      <h1>
        Naozaj chcete zmazat konferenciu{" "}
        {conference?.translations[lng as "sk" | "en"].name} ?
      </h1>

      <Button color="primary" type="submit" fluid>
        Potvrdit
      </Button>
    </form>
  );
}
