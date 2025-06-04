"use client";

import { useDialogStore } from "@/stores/dialogStore";
import {
  cloneElement,
  forwardRef,
  HtmlHTMLAttributes,
  ReactElement,
  Ref,
} from "react";

interface ModalTriggerProps extends HtmlHTMLAttributes<HTMLButtonElement> {
  children: ReactElement;
  dialogId: string;
}

function ModalTrigger(
  { children, dialogId, ...props }: ModalTriggerProps,
  ref: Ref<HTMLElement>
) {
  if (children.type !== "button") {
    console.warn("ModalTrigger expects a <button> element as its child.");
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
