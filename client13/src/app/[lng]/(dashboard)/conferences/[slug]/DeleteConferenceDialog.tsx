"use client";

import { useContext, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import {
  ConferenceQuery,
  ConferenceTranslation,
} from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Message } from "@/components/Message";
import { useRouter } from "next/navigation";
import { deleteConference } from "../actions";

export default function DeleteConferenceDialog({
  conference,
  lng,
}: {
  conference: ConferenceQuery["conference"];
  lng: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { t } = useTranslation(lng, ["common"]);

  const [state, formAction] = useFormState(deleteConference, {
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
        router.push("/conferences");
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
        title="Zmazat konferenciu"
        togglerHidden={false}
      >
        <form className="space-y-6" action={formAction}>
          {dialogOpen && <Message lng={lng} />}

          <input type="hidden" name="id" value={conference.id} />
          <h1>
            Naozaj chcete zmazat konferenciu{" "}
            {conference.translations[lng as "sk" | "en"].name} ?
          </h1>

          <Button color="primary" type="submit" fluid>
            Potvrdit
          </Button>
        </form>
      </Modal>
    </>
  );
}
