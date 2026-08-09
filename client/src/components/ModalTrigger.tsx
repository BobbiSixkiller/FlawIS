"use client";

import { useDialogStore } from "@/stores/dialogStore";
import { ReactElement } from "react";

interface ModalTriggerProps {
  children: ReactElement;
  dialogId: string;
}

export default function ModalTrigger({
  children,
  dialogId,
}: ModalTriggerProps) {
  const { openDialog } = useDialogStore();

  return (
    <span className="contents" onClick={() => openDialog(dialogId)}>
      {children}
    </span>
  );
}
