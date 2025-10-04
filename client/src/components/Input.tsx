"use client";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { withLocalizedInput } from "./withLocalizedInput";
import {
  Control,
  UseFormRegister,
  UseFormSetFocus,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { cn } from "@/utils/helpers";
import { InputHTMLAttributes, useState } from "react";

export interface RHFmethodsProps {
  register: UseFormRegister<any>;
  setFocus: UseFormSetFocus<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  name: string;
  label?: string;
  error?: string;
  errors?: any;
  methods?: RHFmethodsProps;
  control?: Control<any>;
}

function formatDatetimeLocal(val: any, withTime: boolean): string {
  if (!val) return "";
  const date = val instanceof Date ? val : new Date(val);
  if (isNaN(date.getTime())) return "";

  return withTime
    ? date.toISOString().slice(0, 16)
    : date.toISOString().split("T")[0]; // ⏰ "2025-07-19T11:30" or "2025-07-19"
}

//refactor to handle number and dates
export function Input({
  error,
  methods,
  name,
  label,
  onFocus,
  className,
  ...props
}: InputProps) {
  const field = methods?.register?.(name, {
    ...(props.type === "number" ? { valueAsNumber: true } : {}),
    ...(props.type === "datetime-local" || props.type === "date"
      ? { valueAsDate: true as unknown as false }
      : {}),
  });

  const [showPassword, setShowPassword] = useState(false);

  const val = methods?.watch(name);

  return (
    <div className="w-full flex flex-col gap-2">
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
          className,
        ])}
      >
        <input
          className={
            "w-full sm:text-sm/6 bg-transparent border-transparent focus:border-transparent focus:ring-0 py-1.5 h-9 dark:text-white/85 rounded-md disabled:text-slate-500 placeholder:text-gray-400"
          }
          {...props}
          {...field}
          value={
            props.type === "datetime-local" || props.type === "date"
              ? formatDatetimeLocal(val, props.type === "datetime-local")
              : val ?? ""
          }
          onChange={(e) => {
            if (props.onChange) {
              props.onChange(e);
            }
            field?.onChange(e);
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
