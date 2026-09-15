"use client";

import { useDialogStore } from "@/stores/dialogStore";
import { MouseEvent, Ref } from "react";
import Button, { ButtonProps } from "./Button";

interface ModalTriggerProps extends Omit<ButtonProps, "as"> {
  dialogId: string;
  ref?: Ref<HTMLButtonElement>;
  unstyled?: boolean;
}

export default function ModalTrigger({
  dialogId,
  onClick,
  unstyled = false,
  variant,
  size,
  ...props
}: ModalTriggerProps) {
  const openDialog = useDialogStore((state) => state.openDialog);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) openDialog(dialogId);
  };

  // Own the DOM button so streamed content never needs to be cloned for events or refs.
  if (unstyled) {
    return <button type="button" {...props} onClick={handleClick} />;
  }

  return (
    <Button variant={variant} size={size} {...props} onClick={handleClick} />
  );
}
