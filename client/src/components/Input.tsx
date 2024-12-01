"use client";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { InputProps, withLocalizedInput } from "./withLocalizedInput";
import { useController } from "react-hook-form";

export function Input({
  name,
  label,
  onFocus,
  showPassword,
  setShowPassword,
  ...props
}: InputProps) {
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
      <div
        className={`mt-2 flex items-center w-full disabled:bg-slate-50 disabled:text-slate-500 disabled:ring-slate-200 disabled:shadow-none rounded-md text-gray-900 shadow-sm sm:text-sm/6 ring-1 ring-gray-300 ${
          fieldState.error
            ? "ring-red-500 focus-within:ring-red-500"
            : "focus-within:ring-primary-500"
        } focus-within:ring-2`}
      >
        <input
          className={
            "border-none w-full focus:ring-0 py-1.5 rounded-md placeholder:text-gray-400"
          }
          {...props}
          {...field}
          onFocus={onFocus}
          id={name}
          type={showPassword ? "text" : props.type}
        />
        {props.type === "password" && (
          <button
            type="button"
            className="p-2"
            onClick={() => {
              if (setShowPassword) {
                setShowPassword(!showPassword);
              }
            }}
          >
            {showPassword ? (
              <EyeSlashIcon className="size-5" />
            ) : (
              <EyeIcon className="size-5" />
            )}
          </button>
        )}
      </div>

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
