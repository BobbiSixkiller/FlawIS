"use client";

import { useDialogStore } from "@/stores/dialogStore";
import { cloneElement, forwardRef, ReactElement, Ref } from "react";

interface ModalTriggerProps {
  children: ReactElement;
  dialogId: string;
  onClick?: (e: any) => void;
  className?: string;
}

function ModalTrigger(
  { children, dialogId, ...props }: ModalTriggerProps,
  ref: Ref<HTMLElement>
) {
  const { openDialog } = useDialogStore();

  return cloneElement(children, {
    ...props,
    onClick: (e: any) => {
      props.onClick?.(e); // from ModalTrigger usage
      children.props.onClick?.(e); // original child
      openDialog(dialogId);
    },
    ref,
  });
}

export default forwardRef<HTMLElement, ModalTriggerProps>(ModalTrigger);
