"use client";
import { cn } from "@/lib/utilsClient";
import type { ComponentPropsWithRef } from "react";
export type TextareaProps = ComponentPropsWithRef<"textarea">;
export function Textarea({ ref, className, ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      ref={ref}
      className={cn([
        className,
        "disabled:bg-slate-100 disabled:text-slate-500 disabled:ring-slate-200 border-transparent focus:border-transparent disabled:shadow-none block w-full rounded-md py-1.5 text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6",
        "dark:bg-gray-800 dark:ring-gray-600 dark:disabled:bg-gray-900 dark:disabled:ring-gray-700 dark:disabled:text-slate-500 dark:text-white/85",
        props["aria-invalid"]
          ? "ring-red-500 focus:ring-red-500 dark:ring-red-500 dark:focus:ring-red-500"
          : "focus:ring-primary-500 dark:focus:ring-primary-300",
      ])}
    />
  );
}
