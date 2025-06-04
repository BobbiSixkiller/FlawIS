"use client";

import { useDialogStore } from "@/stores/dialogStore";
import {
  cloneElement,
  forwardRef,
  isValidElement,
  ReactElement,
  Ref,
} from "react";

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
  if (isValidElement(children) && children.type !== "button") {
    throw new Error("ModalTrigger expects a <button> element as its child.");
  }

  const { openDialog } = useDialogStore();

  return cloneElement(children, {
    ...props,
    ref,
    onClick: (e: any) => {
      props.onClick?.(e); // from ModalTrigger usage
      children.props.onClick?.(e); // original child
      openDialog(dialogId);
    },
  });
}

export default forwardRef<HTMLElement, ModalTriggerProps>(ModalTrigger);
