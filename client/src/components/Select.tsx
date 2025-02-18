"use client";

import {
  Field,
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { useController } from "react-hook-form";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { cn } from "@/utils/helpers";

interface Option {
  name: string;
  value: any;
}

export default function Select({
  label,
  placeholder,
  name,
  options,
  disabled = false,
  multiple = false,
}: {
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  name: string;
  options: Option[];
  multiple?: boolean;
}) {
  const { field, fieldState } = useController({ name });
  const selected = Array.isArray(field.value)
    ? options.filter((o) => field.value.includes(o.value))
    : options.find((o) => o.value === field.value);

  return (
    <Field>
      {label && (
        <Label className="block text-sm font-medium leading-6 text-gray-900 mb-2 dark:text-white">
          {label}
        </Label>
      )}
      <Listbox
        defaultValue={selected}
        disabled={disabled}
        name={name}
        onChange={(val: Option | Option[]) =>
          Array.isArray(val)
            ? field.onChange(val.map((v) => v.value))
            : field.onChange(val.value)
        }
        multiple={multiple}
        by="value"
      >
        <ListboxButton
          {...field}
          className={cn([
            "h-9 py-1 group flex items-center justify-between px-3 outline-none disabled:bg-slate-50 disabled:ring-slate-200 disabled:shadow-none shadow-sm rounded-md w-full ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-800 focus:ring-2 sm:text-sm/6",
            multiple ? "" : "py-1.5",
            fieldState.error
              ? "ring-red-500 focus:ring-red-500"
              : "focus:ring-primary-500",
          ])}
        >
          <span
            className={`line-clamp-1 ${
              selected && !disabled
                ? "text-gray-900 dark:text-white"
                : "text-gray-500"
            }`}
          >
            {selected
              ? Array.isArray(selected)
                ? selected.map((i) => i.name).join(", ")
                : selected?.name
              : placeholder}
          </span>

          <ChevronDownIcon className="size-3 group-data-[open]:rotate-180 text-gray-300" />
        </ListboxButton>
        <ListboxOptions
          anchor="bottom"
          transition
          className={cn([
            "origin-top transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 sm:text-sm/6 outline-none z-20 w-[var(--button-width)] [--anchor-gap:4px] sm:[--anchor-gap:8px] p-2 rounded-lg shadow-lg text-gray-900 bg-white ring-1 ring-gray-300",
            "dark:bg-gray-700 dark:text-white dark:ring-gray-700",
            fieldState.error ? "ring-red-500" : "",
          ])}
        >
          {options.map((option, i) => (
            <ListboxOption
              key={i}
              value={option}
              className="data-[focus]:bg-primary-500 data-[focus]:text-white data-[selected]:font-semibold cursor-pointer -mx-2 px-2 group flex gap-2 items-center justify-between"
            >
              {option.name}
              <CheckIcon className="size-3 stroke-2 hidden group-data-[selected]:block" />
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
      {fieldState.error && (
        <p className="text-sm text-red-500">{fieldState.error.message}</p>
      )}
    </Field>
  );
}
