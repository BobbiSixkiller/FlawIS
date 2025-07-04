"use client";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { InputProps, withLocalizedInput } from "./withLocalizedInput";
import { useController } from "react-hook-form";
import { cn } from "@/utils/helpers";

//refactor to handle number and dates
export function Input({
  name,
  label,
  onFocus,
  showPassword,
  setShowPassword,
  className,
  ...props
}: InputProps) {
  const { field, fieldState } = useController({
    name,
  });

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium leading-6 text-gray-900 mb-2 dark:text-white/85"
        >
          {label}
        </label>
      )}
      <div
        className={cn([
          "flex items-center rounded-md text-gray-900 shadow-sm ring-1 ring-inset focus-within:ring-2 border-none",
          "dark:bg-gray-800 dark:ring-gray-600 dark:shadow-none",
          fieldState.error
            ? "ring-red-500 dark:ring-red-500 focus-within:ring-red-500"
            : "focus-within:ring-primary-500 dark:focus-within:ring-primary-300 ring-gray-300",
          props.disabled &&
            "bg-slate-100 text-slate-500 ring-slate-200 shadow-none dark:bg-gray-900 dark:ring-gray-700 focus-within:ring-transparent",
          className,
        ])}
      >
        <input
          className={
            "w-full sm:text-sm/6 bg-transparent border-transparent focus:border-transparent focus:ring-0 py-1.5 h-9 dark:text-white/85 rounded-md disabled:text-slate-500 placeholder:text-gray-400"
          }
          {...props}
          {...field}
          onChange={(e) => {
            if (props.onChange) {
              props.onChange(e);
            }
            field.onChange(e);
          }}
          onFocus={onFocus}
          onWheel={(e) => {
            if (props.type === "number") {
              e.currentTarget.blur();
            }
          }}
          id={name}
          type={showPassword ? "text" : props.type}
        />
        {props.type === "password" && (
          <button
            type="button"
            className={cn([
              "p-2 text-gray-400 hover:text-primary-500 focus:outline-none focus:text-primary-500",
              "dark:hover:text-primary-300 dark:text-gray-600 dark:focus:text-primary-300",
            ])}
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
