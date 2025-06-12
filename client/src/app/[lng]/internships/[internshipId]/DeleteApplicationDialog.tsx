"use client";

import Button from "@/components/Button";
import { FormMessage } from "@/components/Message";
import Modal from "@/components/Modal";
import { useTranslation } from "@/lib/i18n/client";
import { useParams } from "next/navigation";
import { useContext, useTransition } from "react";
import Spinner from "@/components/Spinner";
import { TrashIcon } from "@heroicons/react/24/outline";
import { deleteIntern } from "./actions";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";

export default function DeleteApplicationDialog({
  internId,
}: {
  internId: string;
}) {
  const dialogId = "delete-intern";
  const { lng } = useParams<{ lng: string }>();

  const { t } = useTranslation(lng, ["internships", "common"]);

  const [pending, startTransition] = useTransition();
  const closeDialog = useDialogStore((s) => s.closeDialog);
  const openDialog = useDialogStore((s) => s.openDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  function handleClick() {
    startTransition(async () => {
      const state = await deleteIntern(internId);
      setMessage(state.message, state.success);

      if (state.success) {
        closeDialog(dialogId);
      }
    });
  }

  return (
    <div>
      <Button
        size="icon"
        variant="destructive"
        onClick={() => openDialog(dialogId)}
      >
        <TrashIcon className="size-5" />
      </Button>

      <Modal dialogId={dialogId} title={t("deleteIntern.title")}>
        <form className="space-y-6">
          <FormMessage />

          <p>{t("deleteIntern.text")}</p>

          <Button
            className="w-full"
            type="button"
            variant="destructive"
            size="sm"
            disabled={pending}
            onClick={handleClick}
          >
            {pending ? <Spinner inverted /> : t("confirm", { ns: "common" })}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
