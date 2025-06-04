"use client";

import { useContext, useTransition } from "react";
import { UserFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";
import { FormMessage } from "@/components/Message";
import Spinner from "@/components/Spinner";
import { deleteUser } from "./actions";

export default function DeleteUserForm({
  user,
  lng,
}: {
  user: UserFragment;
  lng: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const state = await deleteUser(user.id);

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
    });
  }

  const { t } = useTranslation(lng, ["profile", "common"]);

  const { dispatch } = useContext(MessageContext);

  return (
    <div className="space-y-6 mt-4 sm:w-96 mx-auto">
      <FormMessage />

      <h1>Naozaj chcete zmazat pouzivatela {user.name} ?</h1>

      <Button
        color="primary"
        type="submit"
        className="w-full"
        onClick={handleClick}
        disabled={pending}
      >
        {pending ? <Spinner inverted /> : "Potvrdit"}
      </Button>
    </div>
  );
}
