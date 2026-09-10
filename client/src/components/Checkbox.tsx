"use client";
import Icon from "@/components/Icon";
import { cn } from "@/lib/utilsClient";
import { Checkbox } from "@headlessui/react";
import type { ComponentPropsWithRef } from "react";
export default function CheckBox({
  ref,
  ...props
}: ComponentPropsWithRef<typeof Checkbox>) {
  return (
    <Checkbox
      {...props}
      checked={props.checked ?? false}
      ref={ref}
      className={cn([
        "outline-hidden shadow-xs group size-5 p-1 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-primary-500 data-checked:bg-primary-500 data-checked:ring-primary-500 rounded-md",
        "dark:focus:ring-primary-300 dark:data-checked:ring-primary-300 dark:data-checked:bg-primary-300",
      ])}
    >
      <Icon
        name="check"
        className="hidden size-3 stroke-2 text-white dark:text-gray-900 group-data-checked:block"
      />
    </Checkbox>
  );
}
