"use client";

import { useContext, useTransition } from "react";
import { UserFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import Button from "@/components/Button";
import { impersonate } from "./actions";
import { FormMessage } from "@/components/Message";

export default function ImpersonateForm({
  user,
  lng,
}: {
  user: UserFragment;
  lng: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const state = await impersonate(user.id);

      if (state && !state.success) {
        dispatch({
          type: ActionTypes.SetFormMsg,
          payload: state,
        });
      }
    });
  }

  const { t } = useTranslation(lng, ["profile", "common"]);

  const { dispatch } = useContext(MessageContext);

  return (
    <div className="space-y-6 mt-4 sm:w-96 mx-auto">
      <FormMessage />

      <h1>Prihlasit sa ako {user.name} ?</h1>

      <Button
        color="primary"
        type="submit"
        fluid
        onClick={handleClick}
        loading={pending}
        disabled={pending}
      >
        Potvrdit
      </Button>
    </div>
  );
}
