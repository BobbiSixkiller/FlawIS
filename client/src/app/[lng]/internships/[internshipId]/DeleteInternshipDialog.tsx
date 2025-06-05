"use client";

import Button from "@/components/Button";
import { FormMessage } from "@/components/Message";
import Modal from "@/components/Modal";
import { useTranslation } from "@/lib/i18n/client";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";
import { useContext, useTransition } from "react";
import Spinner from "@/components/Spinner";
import { deleteInternship } from "./actions";
import { useDialogStore } from "@/stores/dialogStore";

export default function DeleteInternshipDialog() {
  const { internshipId, lng } = useParams<{
    internshipId: string;
    lng: string;
  }>();
  const [pending, startTransition] = useTransition();

  const dialogIg = "delete-internship";

  const { openDialog, closeDialog } = useDialogStore();
  const { dispatch } = useContext(MessageContext);

  const handleClick = () =>
    startTransition(async () => {
      const state = await deleteInternship(internshipId);
      if (!state.success) {
        dispatch({ type: ActionTypes.SetFormMsg, payload: state });
      }

      if (state.success) {
        dispatch({ type: ActionTypes.SetAppMsg, payload: state });
        closeDialog(dialogIg);
      }
    });

  const { t } = useTranslation(lng, ["internships", "common"]);

  return (
    <div>
      <Button
        type="button"
        onClick={() => openDialog(dialogIg)}
        variant="destructive"
        className="rounded-full h-full p-2"
      >
        <TrashIcon className="size-5" />
      </Button>

      <Modal title={t("delete.title")} dialogId={dialogIg}>
        <div className="space-y-6">
          <FormMessage />

          <p>{t("delete.text")}</p>

          <Button
            className="w-full"
            type="button"
            disabled={pending}
            onClick={handleClick}
            variant="destructive"
          >
            {pending ? <Spinner inverted /> : t("confirm", { ns: "common" })}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
