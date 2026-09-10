"use client";
import { cn } from "@/lib/utilsClient";
import { Radio, RadioGroup } from "@headlessui/react";
import type { AriaAttributes, Ref } from "react";
export interface RadioGroupProps extends AriaAttributes {
  id?: string;
  name?: string;
  value?: string | null;
  onChange: (value: string) => void;
  onBlur?: () => void;
  ref?: Ref<HTMLElement>;
  disabled?: boolean;
  options: { value: string; text: string }[];
}
export default function RadioGroupField({
  value,
  options,
  disabled,
  ref,
  ...props
}: RadioGroupProps) {
  return (
    <RadioGroup
      {...props}
      value={value ?? ""}
      disabled={disabled}
      className="mt-2 space-y-3"
    >
      {options.map((opt) => (
        <Radio
          ref={opt === options[0] ? ref : undefined}
          key={opt.value}
          value={opt.value}
          className="outline-hidden group flex items-center gap-x-3 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span
            className={cn([
              "min-w-5 size-5 rounded-full ring-1 ring-inset ring-gray-300 shadow-xs flex items-center justify-center",
              "group-data-checked:ring-primary-500 group-data-checked:bg-primary-500",
              "dark:ring-gray-600 dark:group-data-checked:ring-primary-300 dark:group-data-checked:bg-primary-300",
              "group-focus:ring-2 group-focus:ring-primary-500 dark:group-focus:ring-primary-300",
            ])}
          >
            <span className="size-2 rounded-full bg-white dark:bg-gray-900 hidden group-data-checked:block" />
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white/85 cursor-pointer">
            {opt.text}
          </span>
        </Radio>
      ))}
    </RadioGroup>
  );
}
