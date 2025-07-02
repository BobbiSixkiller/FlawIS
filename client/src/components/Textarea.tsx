"use client";

import { cn } from "@/utils/helpers";
import { InputProps, withLocalizedInput } from "./withLocalizedInput";
import { useController } from "react-hook-form";

export function Textarea({ name, label, onFocus, ...props }: InputProps) {
  const { field, fieldState } = useController({ name });

  return (
    <div>
      <label
        htmlFor={name}
        className="block mb-2 text-sm font-medium leading-6 text-gray-900 dark:text-white"
      >
        {label}
      </label>
      <textarea
        {...field}
        {...props}
        onFocus={onFocus}
        id={name}
        className={cn([
          "disabled:bg-slate-100 disabled:text-slate-500 disabled:ring-slate-200 border-transparent focus:border-transparent disabled:shadow-none block w-full rounded-md py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6",
          "dark:bg-gray-800 dark:ring-gray-600 dark:disabled:bg-gray-900 dark:disabled:ring-gray-700 dark:disabled:text-slate-500 dark:text-white",
          fieldState.error
            ? "ring-red-500 focus:ring-red-500"
            : "focus:ring-primary-500 dark:focus:ring-primary-300",
        ])}
      />
      {fieldState.error && (
        <p className="text-sm text-red-500">{fieldState.error.message}</p>
      )}
    </div>
  );
}

export function LocalizedTextarea({
  lng,
  ...props
}: { lng: string } & InputProps) {
  const LocalizedTextarea = withLocalizedInput({ lng, ...props }, Textarea);

  return <LocalizedTextarea />;
}
