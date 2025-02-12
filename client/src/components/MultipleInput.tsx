"use client";

import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useController } from "react-hook-form";
import { InputProps, withLocalizedInput } from "./withLocalizedInput";
import { cn } from "@/utils/helpers";

export function MultipleInput({ label, name, onFocus, ...props }: InputProps) {
  const { field, fieldState } = useController({ name });

  const strings: string[] = field.value || [];

  const [input, setInput] = useState("");
  const [focus, setFocus] = useState(false);

  // Handle key down event on input field
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && input === "") {
      // Prevent the default backspace behavior
      event.preventDefault();
      field.onChange(strings.slice(0, -1));
    } else if (event.key === "Enter" && input.trim() !== "") {
      // Prevent form submission
      event.preventDefault();
      field.onChange(Array.from(new Set(strings).add(input)));
      setInput("");
    }
  };

  return (
    <div>
      <label
        htmlFor={name}
        className="block mb-2 text-sm font-medium leading-6 text-gray-900"
      >
        {label}
      </label>
      <div
        className={cn([
          "py-1 pl-2.5 flex flex-wrap gap-1 w-full rounded-md border-0 ring-gray-300 shadow-sm sm:text-sm sm:leading-6 relative",
          focus ? "ring-2 ring-primary-500" : "ring-1",
          fieldState.error ? "ring-red-500" : "",
          props.disabled
            ? "text-slate-500 bg-slate-100 ring-slate-200"
            : "bg-white text-gray-900",
        ])}
        onClick={() => {
          if (!props.disabled) {
            setFocus(true);
          }
        }}
      >
        {strings.length !== 0 &&
          strings.map((p, i) => (
            <div
              className="flex gap-1 whitespace-nowrap rounded-md bg-gray-300 px-1 h-7 items-center"
              key={i}
            >
              {p}
              <button
                disabled={props.disabled}
                type="button"
                className="hover:text-gray-500 p-1 focus:outline-none focus:ring-primary-500 focus:ring-2 rounded-md"
                onClick={() => {
                  if (!props.disabled) {
                    field.onChange(strings.filter((i) => i !== p));
                  }
                }}
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        <div className="flex-1 flex gap-1 bg-transparent">
          <input
            {...props}
            {...field}
            id={name}
            className="w-full sm:text-sm sm:leading-6 bg-transparent text-gray-900 border-none rounded-r-none rounded-l-md p-0 placeholder:truncate focus:ring-transparent"
            onFocus={(e) => {
              if (!props.disabled) {
                setFocus(true);
                if (onFocus) {
                  onFocus(e);
                }
              }
            }}
            onBlur={() => setFocus(false)}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            disabled={props.disabled}
            type="button"
            className="p-2 disabled:hover:text-gray-400 hover:text-primary-500 text-gray-400 focus:outline-none focus:ring-primary-500 focus:ring-2 rounded-md"
            onClick={() => {
              if (input !== "") {
                field.onChange(Array.from(new Set(strings).add(input)));
                setInput("");
                setFocus(true);
              }
            }}
          >
            <PlusIcon className="size-3 stroke-2" />
          </button>
        </div>
      </div>
      {fieldState.error && (
        <p className="text-sm text-red-500">
          {Array.isArray(fieldState.error)
            ? fieldState.error[0].message
            : fieldState.error.message}
        </p>
      )}
    </div>
  );
}

export function LocalizedMultipleInput({
  lng,
  ...props
}: { lng: string } & InputProps) {
  const LocalizedMultipleInput = withLocalizedInput(
    { lng, ...props },
    MultipleInput
  );

  return <LocalizedMultipleInput />;
}
