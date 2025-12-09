"use client";

import { useEffect, useTransition } from "react";
import { UserFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import Button from "../../../components/Button";
import { activate, resendActivationLink } from "@/app/[lng]/(auth)/actions";

import Spinner from "@/components/Spinner";
import Modal from "@/components/Modal";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";

export default function ActivateAccountDialog({
  lng,
  user,
}: {
  lng: string;
  user?: UserFragment;
}) {
  const { t } = useTranslation(lng, "activateAccount");

  const dialogId = "activate";
  const openDialog = useDialogStore((s) => s.openDialog);
  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  useEffect(() => {
    if (user && user?.verified) {
      closeDialog(dialogId);
    } else {
      openDialog(dialogId);
    }
  }, [user]);

  useEffect(() => {
    async function activateCb() {
      const res = await activate();
      if (res) {
        setMessage(res.message, res.success);
      }
    }

    activateCb();
  }, []);

  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      const res = await resendActivationLink();
      if (res) {
        setMessage(res.message, res.success);
      }
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
      </div>
    </Modal>
  );
}
