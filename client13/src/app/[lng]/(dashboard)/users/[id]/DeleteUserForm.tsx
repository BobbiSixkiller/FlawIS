"use client";

import { useContext, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { UserFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { deleteUser } from "../actions";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import Button from "@/components/Button";
import { Message } from "@/components/Message";
import { useRouter } from "next/navigation";

export default function DeleteUserForm({
  user,
  lng,
}: {
  user: UserFragment;
  lng: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { t } = useTranslation(lng, ["profile", "common"]);

  const [state, formAction] = useFormState(deleteUser, {
    success: false,
    message: "",
  });

  const { dispatch, dialogOpen } = useContext(MessageContext);

  useEffect(() => {
    if (state.message) {
      dispatch({
        type: ActionTypes.SetMsg,
        payload: {
          positive: state.success,
          content: state.message,
          dialogOpen: !state.success,
        },
      });

      if (state.success) {
        setOpen(false);
        router.push("/users");
      }
    }
  }, [state]);

  return (
    <form className="space-y-6 " action={formAction}>
      <Message lng={lng} />

      <input type="hidden" name="id" value={user.id} />
      <h1>Naozaj chcete zmazat pouzivatela {user.name} ?</h1>

      <Button color="primary" type="submit" fluid>
        Potvrdit
      </Button>
    </form>
  );
}
