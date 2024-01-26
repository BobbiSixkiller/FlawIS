"use client";

import { useContext, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { UserFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { deleteUser } from "../actions";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Message } from "@/components/Message";
import { useRouter } from "next/navigation";

export default function UserDeleteDialog({
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
    <>
      <Button color="red" type="button" onClick={() => setOpen(true)}>
        <TrashIcon className="h-4 w-4" aria-hidden="true" />
      </Button>
      <Modal
        isOpen={open || false}
        onClose={() => setOpen(false)}
        title={t("heading", { ns: "profile" })}
        togglerHidden={false}
      >
        <form className="space-y-6" action={formAction}>
          {dialogOpen && <Message lng={lng} />}

          <input type="hidden" name="id" value={user.id} />
          <h1>Naozaj chcete zmazat pouzivatela {user.name} ?</h1>

          <Button color="primary" type="submit" fluid>
            Potvrdit
          </Button>
        </form>
      </Modal>
    </>
  );
}
