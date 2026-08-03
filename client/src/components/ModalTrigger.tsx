"use client";

import { useDialogStore } from "@/stores/dialogStore";
import {
  cloneElement,
  MouseEvent as ReactMouseEvent,
  MouseEventHandler,
  ReactElement,
} from "react";

interface TriggerChildProps {
  className?: string;
  onClick?: MouseEventHandler<HTMLElement>;
}

interface ModalTriggerProps {
  children: ReactElement<TriggerChildProps>;
  dialogId: string;
  onClick?: MouseEventHandler<HTMLElement>;
  className?: string;
}

export default function ModalTrigger({
  children,
  dialogId,
  ...props
}: ModalTriggerProps) {
  const { openDialog } = useDialogStore();

  return cloneElement(children, {
    ...props,
    onClick: (event: ReactMouseEvent<HTMLElement>) => {
      props.onClick?.(event);
      children.props.onClick?.(event);
      openDialog(dialogId);
    },
  });
}
