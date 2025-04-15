"use client";

import { useContext, useEffect, useTransition } from "react";
import { UserFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import Button from "../../../components/Button";
import { activate, resendActivationLink } from "@/app/[lng]/(auth)/actions";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";

import { FormMessage } from "@/components/Message";
import Spinner from "@/components/Spinner";
import Modal from "@/components/Modal";
import { useDialog } from "@/providers/DialogProvider";

export default function ActivateAccountDialog({
  lng,
  user,
}: {
  lng: string;
  user?: UserFragment;
}) {
  const { dispatch } = useContext(MessageContext);

  const { t } = useTranslation(lng, "activateAccount");

  const dialogId = "activate";
  const { closeDialog, openDialog } = useDialog();

  useEffect(() => {
    if (user?.verified) {
      closeDialog(dialogId);
    } else {
      openDialog(dialogId);
    }
  }, [user]);

  useEffect(() => {
    async function activateCb() {
      const res = await activate();
      if (res && !res.success) {
        dispatch({
          type: ActionTypes.SetFormMsg,
          payload: res,
        });
      }
      if (res?.message && res.success) {
        dispatch({
          type: ActionTypes.SetAppMsg,
          payload: res,
        });
      }
    }

    activateCb();
  }, []);

  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      const state = await resendActivationLink();
      dispatch({
        type: ActionTypes.SetFormMsg,
        payload: state,
      });
    });
  };

  return (
    <Modal dialogId={dialogId} title={t("heading")} togglerHidden>
      <div className="flex flex-col gap-4 sm:max-w-96">
        <p>{t("body")}</p>

        <Button
          className="w-full"
          type="button"
          size="sm"
          disabled={isPending}
          onClick={onClick}
        >
          {isPending ? <Spinner inverted /> : t("button")}
        </Button>

        <FormMessage />
      </div>
    </Modal>
  );
}
