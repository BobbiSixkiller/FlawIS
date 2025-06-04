"use client";

import { useContext } from "react";
import { SectionFragment } from "@/lib/graphql/generated/graphql";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import Button from "@/components/Button";
import { deleteSection } from "./actions";
import { FormMessage } from "@/components/Message";
import { useDialogStore } from "@/stores/dialogStore";

export default function DeleteSectionForm({
  section,
  lng,
  dialogId,
}: {
  section: SectionFragment;
  lng: string;
  dialogId: string;
}) {
  const { dispatch } = useContext(MessageContext);

  const { closeDialog } = useDialogStore();

  return (
    <form
      className="space-y-6 min-w-80"
      action={async (data) => {
        const state = await deleteSection(null, data);

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
      }}
    >
      <FormMessage />

      <input type="hidden" name="id" value={section.id} />

      <h1>
        Naozaj chcete zmazat sekciu{" "}
        {section?.translations[lng as "sk" | "en"].name} ?
      </h1>

      <Button color="primary" type="submit" className="w-full">
        Potvrdit
      </Button>
    </form>
  );
}
