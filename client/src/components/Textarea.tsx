"use client";

import { InputProps, withLocalizedInput } from "./withLocalizedInput";
import { useFormContext } from "react-hook-form";

export function Textarea({ name, label, onFocus, ...props }: InputProps) {
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
      <textarea
        {...props}
        onFocus={onFocus}
        {...register(name)}
        id={name}
        placeholder={props.placeholder}
        className={
          "disabled:bg-slate-100 disabled:text-slate-500 disabled:ring-slate-200 border-transparent focus:border-transparent disabled:shadow-none block w-full rounded-md py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
        }
      />
      {error && <p className="text-sm text-red-500">{error.message}</p>}
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
