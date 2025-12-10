"use client";

import { ReactNode, useState } from "react";
import { Field, Label, Switch } from "@headlessui/react";
import { cn } from "@/utils/helpers";

const sizeMap = {
  regular: { container: "h-[38px] w-[74px]", btn: "h-[34px] w-[34px]" },
  small: { container: "h-[26px] w-[42px]", btn: "h-[22px] w-[22px]" },
};

type SizeType = keyof typeof sizeMap;

export default function Toggle({
  label,
  name,
  defaultChecked,
  handleToggle,
  icon,
  size = "regular",
  disabled = false,
}: {
  label?: string;
  name?: string;
  defaultChecked: boolean;
  handleToggle: () => void;
  icon?: ReactNode;
  size?: SizeType;
  disabled?: boolean;
}) {
  const [enabled, setEnabled] = useState(defaultChecked);

  return (
    <Field as="div" className="flex gap-2 items-center">
      {label && <Label>{label}</Label>}
      <Switch
        disabled={disabled}
        name={name}
        checked={enabled}
        onChange={(checked) => {
          handleToggle();
          setEnabled(checked);
        }}
        className={cn([
          "disabled:bg-gray-300 dark:disabled:bg-gray-600",
          enabled
            ? "bg-primary-700 dark:bg-primary-400"
            : "bg-primary-400 dark:bg-primary-300",
          sizeMap[size].container,
          "relative inline-flex  shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-primary-500",
        ])}
      >
        <span className="sr-only">Use toggle</span>
        <span
          aria-hidden="true"
          className={cn([
            enabled
              ? size === "regular"
                ? "translate-x-9"
                : "translate-x-4"
              : "translate-x-0",
            sizeMap[size].btn,
            "dark:bg-gray-800",
            "pointer-events-none inline-flex transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out items-center justify-center",
          ])}
        >
          {icon}
        </span>
      </Switch>
    </Field>
  );
}
