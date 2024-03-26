"use client";

import Modal from "./Modal";
import { useContext, useEffect, useState } from "react";
import { UserFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import Button from "./Button";
import { activate, resendActivationLink } from "@/app/[lng]/(auth)/actions";
import { useFormState } from "react-dom";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { Message } from "./Message";

export default function ActivateAccountDialog({
  lng,
  user,
}: {
  lng: string;
  user?: UserFragment;
}) {
  const [state, action] = useFormState(resendActivationLink, {
    success: false,
    message: "",
  });

  const [open, setOpen] = useState(user && !user?.verified);
  const { dispatch } = useContext(MessageContext);

  const { t } = useTranslation(lng, "activateAccount");

  useEffect(() => {
    async function activateCb() {
      const res = await activate();
      if (res) {
        dispatch({
          type: ActionTypes.SetMsg,
          payload: {
            positive: res.success,
            content: res.message,
            dialogOpen: true,
          },
        });
      }
    }

    activateCb();
  }, []);

  useEffect(() => {
    if (state.message) {
      dispatch({
        type: ActionTypes.SetMsg,
        payload: {
          positive: state.success,
          content: state.message,
          dialogOpen: true,
        },
      });
    }
  }, [state]);

  return (
    <Modal
      isOpen={open || false}
      onClose={() => setOpen(!user?.verified)}
      title={t("heading")}
      togglerHidden={true}
    >
      <form action={action} className="flex flex-col gap-4">
        {t("body")}
        <Button color="primary" type="submit">
          {t("button")}
        </Button>
        <Message lng={lng} />
      </form>
    </Modal>
  );
}
