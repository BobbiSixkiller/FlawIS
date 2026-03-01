"use client";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { withLocalizedInput } from "./withLocalizedInput";
import {
  Control,
  useController,
  useFormContext,
  useFormState,
} from "react-hook-form";
import { cn, formatDatetimeLocal } from "@/utils/helpers";
import { InputHTMLAttributes, useState } from "react";
import { get } from "lodash";

export interface InputProps extends InputHTMLAttributes<
  HTMLInputElement | HTMLTextAreaElement
> {
  name: string;
  label?: string;
  control?: Control<any>;
}

export function Input({
  name,
  label,
  onFocus,
  className,
  ...props
}: InputProps) {
  const { control } = useFormContext();
  const { errors } = useFormState({ control, name });

  const isDate = props.type === "datetime-local" || props.type === "date";

  // useController reads the current value synchronously on every render —
  // no subscription timing lag unlike useWatch which returns undefined on first mount.
  const { field } = useController({ name, control });

  const error = get(errors, name)?.message?.toString();

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={cn(["w-full flex flex-col gap-2", className])}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium leading-6 text-gray-900 dark:text-white/85"
        >
          {label}
        </label>
      )}
      <div
        className={cn([
          "flex items-center rounded-md text-gray-900 shadow-sm ring-1 ring-inset focus-within:ring-2 border-none",
          "dark:bg-gray-800 dark:ring-gray-600 dark:shadow-none",
          error
            ? "ring-red-500 dark:ring-red-500 focus-within:ring-red-500"
            : "focus-within:ring-primary-500 dark:focus-within:ring-primary-300 ring-gray-300",
          props.disabled &&
            "bg-slate-100 text-slate-500 ring-slate-200 shadow-none dark:bg-gray-900 dark:ring-gray-700 focus-within:ring-transparent",
        ])}
      >
        <input
          className={
            "w-full sm:text-sm/6 bg-transparent border-transparent focus:border-transparent focus:ring-0 py-1.5 h-9 dark:text-white/85 rounded-md disabled:text-slate-500 placeholder:text-gray-400"
          }
          {...props}
          ref={field.ref}
          name={field.name}
          onBlur={field.onBlur}
          disabled={field.disabled ?? props.disabled}
          value={
            isDate
              ? formatDatetimeLocal(
                  field.value,
                  props.type === "datetime-local",
                )
              : (field.value ?? "")
          }
          onChange={(e) => {
            let val: any;
            if (props.type === "number") val = e.target.valueAsNumber;
            else if (isDate)
              // valueAsDate is null for datetime-local (browser limitation),
              // so fall back to parsing the value string as a local Date.
              val =
                e.target.valueAsDate ??
                (e.target.value ? new Date(e.target.value) : null);
            else val = e.target.value;

            field.onChange(val);
            props.onChange?.(e);
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
              setShowPassword(!showPassword);
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

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export const LocalizedInput = withLocalizedInput(Input);
