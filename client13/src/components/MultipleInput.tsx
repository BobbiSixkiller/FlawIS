"use client";

import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { InputHTMLAttributes, useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { InputProps, withLocalizedInput } from "./withLocalizedInput";

export function MultipleInput({
  label,
  name,
  onFocus,
}: {
  label: string;
  name: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  const { watch, setValue, getFieldState } = useFormContext();
  const { error } = getFieldState(name);

  const [strings, setStrings] = useState(watch(name) as string[]);
  const [val, setVal] = useState("");
  const [focus, setFocus] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focus) {
      ref.current?.focus();
    }
  }, [focus]);

  useEffect(() => {
    setValue(name, strings);
  }, [strings]);

  // Handle key down event on input field
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && val === "") {
      // Prevent the default backspace behavior
      event.preventDefault();
      setStrings((prev) => prev.slice(0, -1));
    } else if (event.key === "Enter" && val.trim() !== "") {
      event.preventDefault(); // Prevent form submission
      setStrings((prev) => Array.from(new Set(prev).add(val)));
      setVal("");
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
        className={`py-1.5 pl-2.5 flex flex-wrap gap-1  w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 ${
          focus ? "ring-primary-500 ring-2" : ""
        } shadow-sm sm:text-sm sm:leading-6 relative`}
        onClick={() => setFocus(true)}
      >
        {strings.length !== 0 &&
          strings.map((p, i) => (
            <div
              className="flex gap-1 whitespace-nowrap rounded-md bg-gray-300 px-1 items-center"
              key={i}
            >
              {p}
              <button
                className="hover:text-gray-500 p-1 focus:outline-none focus:ring-primary-500 focus:ring-2 rounded-md"
                onClick={() =>
                  setStrings((prev) => prev.filter((i) => i !== p))
                }
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        <input
          className="flex-1 sm:text-sm sm:leading-6 border-none rounded-r-none rounded-l-md p-0 placeholder:text-gray-400 focus:ring-transparent"
          onFocus={(e) => {
            setFocus(true);
            if (onFocus) {
              onFocus(e);
            }
          }}
          onBlur={() => setFocus(false)}
          ref={ref}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="p-2 hover:text-primary-500 text-gray-400 focus:outline-none focus:ring-primary-500 focus:ring-2 rounded-md"
          onClick={() => {
            setStrings((prev) => Array.from(new Set(prev).add(val)));
            setVal("");
            setFocus(true);
          }}
        >
          <PlusIcon className="h-3 w-3" />
        </button>
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
