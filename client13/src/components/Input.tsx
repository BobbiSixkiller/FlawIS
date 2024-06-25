"use client";

import { InputHTMLAttributes } from "react";
import { withLocalizedInput } from "./withLocalizedInput";
import { useFormContext } from "react-hook-form";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
}

export function Input({ name, label, onFocus, ...props }: InputProps) {
  const { register, getFieldState } = useFormContext();

  const { error } = getFieldState(name);

  return (
    <div>
      <label
        htmlFor={name}
        className="block mb-2 text-sm font-medium leading-6 text-gray-900"
      >
        {label}
      </label>
      <input
        {...props}
        {...register(name)}
        onFocus={onFocus}
        id={name}
        className={
          props.type === "file"
            ? `block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4 file:rounded-md
                  file:border-0 file:text-sm file:font-semibold
                  file:bg-pink-50 file:text-pink-700
                  hover:file:bg-pink-100`
            : "disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
        }
      />
      {error && <p className="text-sm text-red-500">{error.message}</p>}
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
