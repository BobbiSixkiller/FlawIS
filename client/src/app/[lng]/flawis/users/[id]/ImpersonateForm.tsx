"use client";

import { useContext, useTransition } from "react";
import { UserFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import Button from "@/components/Button";
import { FormMessage } from "@/components/Message";
import Spinner from "@/components/Spinner";
import { impersonate } from "./actions";
import { useDialogStore } from "@/stores/dialogStore";

export default function ImpersonateForm({
  user,
  dialogId,
}: {
  user: Pick<UserFragment, "id" | "name">;
  lng: string;
  dialogId: string;
}) {
  const [pending, startTransition] = useTransition();

  const { closeDialog } = useDialogStore();

  function handleClick() {
    startTransition(async () => {
      const state = await impersonate(user.id);

      if (state && !state.success) {
        dispatch({
          type: ActionTypes.SetFormMsg,
          payload: state,
        });
      }

      if (state && state.success) {
        closeDialog(dialogId);
      }
    });
  }

  const { dispatch } = useContext(MessageContext);

  return (
    <div className="space-y-6 mt-4 sm:w-96 mx-auto">
      <FormMessage />

      <h1>Prihlasit sa ako {user.name} ?</h1>

      <Button
        color="primary"
        type="submit"
        className="w-full"
        onClick={handleClick}
        disabled={pending}
      >
        {pending ? <Spinner inverted /> : "Potvridt"}
      </Button>
    </div>
  );
}
