"use client";

import { InputProps, withLocalizedInput } from "./withLocalizedInput";
import { useController } from "react-hook-form";

export function Input({ name, label, onFocus, ...props }: InputProps) {
  const { field, fieldState } = useController({ name });

  return (
    <div>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {label}
        </label>
      )}
      <input
        {...props}
        {...field}
        onFocus={onFocus}
        id={name}
        className={
          props.type === "file"
            ? `mt-2 block w-full sm:text-sm/6 text-slate-500
                  file:mr-4 file:py-2 file:px-4 file:rounded-md
                  file:border-0 file:text-sm file:font-semibold
                  file:bg-pink-50 file:text-pink-700
                  hover:file:bg-pink-100`
            : `mt-2 outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:ring-slate-200 disabled:shadow-none block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 sm:text-sm/6 ${
                fieldState.error
                  ? "ring-red-500 focus:ring-red-500"
                  : "focus:ring-primary-500"
              }`
        }
      />
      {fieldState.error && (
        <p className="text-sm text-red-500">{fieldState.error.message}</p>
      )}
    </div>
  );
}

export function LocalizedInput({
  lng,
  ...props
}: { lng: string } & InputProps) {
  const LocalizedInput = withLocalizedInput({ lng, ...props }, Input);

  return <LocalizedInput />;
}
