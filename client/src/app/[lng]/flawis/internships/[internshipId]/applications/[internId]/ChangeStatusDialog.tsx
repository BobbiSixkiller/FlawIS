"use client";

import { Status } from "@/lib/graphql/generated/graphql";
import { ReactNode, useContext, useTransition } from "react";
import { changeInternStatus } from "./actions";
import { useParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";
import Button, { VariantType } from "@/components/Button";
import Spinner from "@/components/Spinner";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { FormMessage } from "@/components/Message";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ArrowUturnLeftIcon } from "@heroicons/react/20/solid";
import Modal from "@/components/Modal";
import { useDialogStore } from "@/stores/dialogStore";

type TriggerButtonState = {
  icon: ReactNode;
  variant: VariantType;
};

type TriggerButton = {
  Applied: TriggerButtonState;
  Eligible: TriggerButtonState;
  Accepted: TriggerButtonState;
  Rejected: TriggerButtonState;
};

const triggerButton: TriggerButton = {
  Applied: {
    icon: <ArrowUturnLeftIcon className="size-5" />,
    variant: "default",
  },
  Eligible: { icon: <CheckIcon className="size-5" />, variant: "positive" },
  Accepted: { icon: <CheckIcon className="size-5" />, variant: "positive" },
  Rejected: {
    icon: <XMarkIcon className="size-5" />,
    variant: "destructive",
  },
};

export default function ChangeStatusDialog({
  status,
  disabled,
}: {
  status: Status;
  disabled: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const { internId: id, lng } = useParams<{ internId: string; lng: string }>();

  const { openDialog, closeDialog } = useDialogStore();
  const { dispatch } = useContext(MessageContext);

  const handleClick = () =>
    startTransition(async () => {
      const state = await changeInternStatus({ id, status });
      if (!state.success) {
        dispatch({ type: ActionTypes.SetFormMsg, payload: state });
      }

      if (state.success) {
        dispatch({ type: ActionTypes.SetAppMsg, payload: state });
        closeDialog(status);
      }
    });

  const { t } = useTranslation(lng, ["internships", "common"]);

  return (
    <div className="flex items-center">
      <Button
        size="icon"
        type="button"
        onClick={() => openDialog(status)}
        disabled={disabled}
        variant={triggerButton[status].variant}
      >
        {triggerButton[status].icon}
      </Button>

      <Modal title="Zmenit status" dialogId={status}>
        <div className="space-y-6">
          <FormMessage />
          <p>
            Naozaj si prajete zmenit stav prihlasky na{" "}
            {t(status).toLocaleLowerCase()} ?
          </p>
          <Button
            className="w-full"
            type="button"
            disabled={pending}
            onClick={handleClick}
          >
            {pending ? <Spinner inverted /> : t("confirm", { ns: "common" })}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
