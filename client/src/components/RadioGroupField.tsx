"use client";

import { cn } from "@/utils/helpers";
import { Field, Label, Radio, RadioGroup } from "@headlessui/react";
import { Control, useController } from "react-hook-form";

export default function RadioGroupField({
  name,
  label,
  control,
  options,
  disabled,
}: {
  name: string;
  label: string;
  control: Control<any>;
  options: { value: string; text: string }[];
  disabled?: boolean;
}) {
  const { field, fieldState } = useController({ name, control });

  return (
    <Field>
      <Label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white/85">
        {label}
      </Label>
      <RadioGroup
        value={field.value ?? ""}
        onChange={field.onChange}
        disabled={disabled}
        className="mt-2 space-y-3"
      >
        {options.map((opt) => (
          <Radio
            key={opt.value}
            value={opt.value}
            className="outline-none group flex items-center gap-x-3 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span
              className={cn([
                "min-w-5 size-5 rounded-full ring-1 ring-inset ring-gray-300 shadow-sm flex items-center justify-center",
                "group-data-[checked]:ring-primary-500 group-data-[checked]:bg-primary-500",
                "dark:ring-gray-600 dark:group-data-[checked]:ring-primary-300 dark:group-data-[checked]:bg-primary-300",
                "group-focus:ring-2 group-focus:ring-primary-500 dark:group-focus:ring-primary-300",
              ])}
            >
              <span className="size-2 rounded-full bg-white dark:bg-gray-900 hidden group-data-[checked]:block" />
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white/85 cursor-pointer">
              {opt.text}
            </span>
          </Radio>
        ))}
      </RadioGroup>
      {fieldState.error && (
        <p className="text-sm text-red-500 mt-2">{fieldState.error.message}</p>
      )}
    </Field>
  );
}
