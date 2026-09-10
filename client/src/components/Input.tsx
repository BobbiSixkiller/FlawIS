"use client";
import Icon from "@/components/Icon";
import { cn } from "@/lib/utilsClient";
import { useState, type ComponentPropsWithRef } from "react";
export type InputProps = ComponentPropsWithRef<"input">;
export function Input({ ref, className, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div
      className={cn([
        className,
        "flex items-center rounded-md text-gray-900 shadow-xs ring-1 ring-inset focus-within:ring-2 border-none",
        "dark:bg-gray-800 dark:ring-gray-600 dark:shadow-none",
        props["aria-invalid"]
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
        ref={ref}
        onWheel={(event) => {
          if (props.type === "number") event.currentTarget.blur();
          props.onWheel?.(event);
        }}
        type={showPassword ? "text" : props.type}
      />
      {props.type === "password" && (
        <button
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          className={cn([
            "p-2 text-gray-400 hover:text-primary-500 focus:outline-hidden focus:text-primary-500",
            "dark:hover:text-primary-300 dark:text-gray-600 dark:focus:text-primary-300",
          ])}
          onClick={() => {
            setShowPassword(!showPassword);
          }}
        >
          {showPassword ? (
            <Icon name="eye-slash" className="size-5" />
          ) : (
            <Icon name="eye" className="size-5" />
          )}
        </button>
      )}
    </div>
  );
}
