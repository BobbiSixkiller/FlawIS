"use client";

import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { InputHTMLAttributes, useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { InputProps, withLocalizedInput } from "./withLocalizedInput";

export function MultipleInput({
  label,
  name,
  onFocus,
  disabled,
}: {
  label: string;
  name: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  const { watch, setValue, getFieldState, register } = useFormContext();
  const strings: string[] = watch(name, []);
  const { error } = getFieldState(name);

  const [input, setInput] = useState("");
  const [focus, setFocus] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focus) {
      ref.current?.focus();
    }
  }, [focus]);

  // Handle key down event on input field
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && input === "") {
      // Prevent the default backspace behavior
      event.preventDefault();
      setValue(name, strings.slice(0, -1), {
        shouldTouch: true,
        shouldValidate: true,
      });
    } else if (event.key === "Enter" && input.trim() !== "") {
      event.preventDefault(); // Prevent form submission
      setValue(name, Array.from(new Set(strings).add(input)), {
        shouldTouch: true,
        shouldValidate: true,
      });
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
        className={`py-1.5 pl-2.5 flex flex-wrap gap-1  w-full rounded-md border-0 ${
          disabled ? "text-slate-500 bg-slate-100" : "text-gray-900"
        } shadow-sm ring-1 ring-gray-300 ${
          focus ? "ring-primary-500 ring-2" : ""
        } shadow-sm sm:text-sm sm:leading-6 relative`}
        onClick={() => {
          if (!disabled) {
            setFocus(true);
          }
        }}
      >
        {strings.length !== 0 &&
          strings.map((p, i) => (
            <div
              className="flex gap-1 whitespace-nowrap rounded-md bg-gray-300 px-1 items-center"
              key={i}
            >
              {p}
              <button
                type="button"
                className="hover:text-gray-500 p-1 focus:outline-none focus:ring-primary-500 focus:ring-2 rounded-md"
                onClick={() => {
                  if (!disabled) {
                    setValue(
                      name,
                      strings.filter((i) => i !== p),
                      {
                        shouldTouch: true,
                        shouldValidate: true,
                      }
                    );
                  }
                }}
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        <div className="flex-1 flex gap-1">
          <input
            disabled={disabled}
            {...register(name)}
            className={`w-full sm:text-sm sm:leading-6 ${
              disabled ? "text-slate-500 bg-slate-100" : "text-gray-900"
            } border-none rounded-r-none rounded-l-md p-0 placeholder:text-gray-400 focus:ring-transparent`}
            onFocus={(e) => {
              if (!disabled) {
                setFocus(true);
                if (onFocus) {
                  onFocus(e);
                }
              }
            }}
            onBlur={() => setFocus(false)}
            ref={ref}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            className="p-2 hover:text-primary-500 text-gray-400 focus:outline-none focus:ring-primary-500 focus:ring-2 rounded-md"
            onClick={() => {
              if (input !== "") {
                setValue(name, Array.from(new Set(strings).add(input)), {
                  shouldTouch: true,
                  shouldValidate: true,
                });
                setInput("");
                setFocus(true);
              }
            }}
          >
            <PlusIcon className="h-3 w-3" />
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error.message}</p>}
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
