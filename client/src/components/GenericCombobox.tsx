"use client";

import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import Spinner from "./Spinner";
import { cn } from "@/utils/helpers";
import useWidth from "@/hooks/useWidth";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface GenericComboboxProps<T> {
  value?: T | T[];
  defaultOptions: T[];
  multiple?: boolean;
  onChange: (value: T | T[]) => void;
  fetchOptions?: (query: string) => Promise<T[]>;
  placeholder?: string;
  renderOption: (
    option: T,
    props: { focus: boolean; selected: boolean }
  ) => React.ReactElement;
  renderInputValue?: (option: T) => string;
  getOptionLabel?: (option: T) => string;
  allowCreateNewOptions?: boolean;
}

export default function GenericCombobox<T extends { id: string | number }>({
  value,
  onChange,
  multiple,
  defaultOptions,
  fetchOptions,
  placeholder,
  renderOption,
  renderInputValue,
  getOptionLabel,
  allowCreateNewOptions,
}: GenericComboboxProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const [boxWidth, setBoxWidth] = useState(0);
  const width = useWidth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<T[]>(defaultOptions);

  const debounced = useDebouncedCallback(
    // function
    (value: string) => {
      setText(value);
    },
    // delay in ms
    500
  );

  useEffect(() => {
    async function getOrFilterOptions() {
      if (fetchOptions && text) {
        setLoading(true);
        const res = await fetchOptions(text);
        setLoading(false);
        setOptions(res);
      } else {
        const filtered =
          text === ""
            ? defaultOptions
            : defaultOptions.filter((opt) =>
                getOptionLabel?.(opt).toLowerCase().includes(text.toLowerCase())
              );

        setOptions(filtered);
      }
    }

    getOrFilterOptions();
  }, [text]);

  console.log(options);

  useEffect(() => {
    if (ref.current?.getBoundingClientRect().width) {
      setBoxWidth(ref.current?.getBoundingClientRect().width);
    }
  }, [ref, width]);

  return (
    <Combobox
      multiple={multiple}
      value={value}
      onChange={onChange}
      onClose={() => setText("")}
      immediate
    >
      <div
        className={cn([
          "flex gap-2 rounded-md border",
          "dark:border-gray-600 dark:bg-gray-800",
        ])}
        ref={ref}
      >
        <ComboboxInput
          className="text-gray-900 dark:text-white/85 bg-transparent border-transparent focus:border-transparent focus:ring-0 w-full h-9"
          placeholder={placeholder}
          aria-label="Assignee"
          onChange={(event) => setText(event.target.value)}
          displayValue={() => ""}
        />
        {loading && <Spinner />}
        <ComboboxButton className="p-2 text-gray-400">
          {({ open }) =>
            open ? (
              <ChevronUpIcon className="size-3" aria-hidden="true" />
            ) : (
              <ChevronDownIcon className="size-3" aria-hidden="true" />
            )
          }
        </ComboboxButton>
      </div>

      <ComboboxOptions
        style={{ width: boxWidth }}
        transition
        anchor="bottom start"
        className={cn([
          "[--anchor-gap:4px] sm:[--anchor-gap:8px] origin-top border transition duration-200 ease-out empty:invisible data-closed:scale-95 data-closed:opacity-0",
          "top-0 z-50 overflow-auto max-h-40 empty:invisible rounded-md bg-white text-gray-900 shadow-lg ring-1 ring-black/5 focus:outline-none",
          "dark:bg-gray-600 dark:text-white/85 dark:border-gray-700",
        ])}
      >
        {allowCreateNewOptions && text.length > 0 && (
          <ComboboxOption
            value={{ id: null, name: text }}
            className="data-[focus]:bg-primary-500 dark:data-[focus]:bg-primary-300 p-2 cursor-pointer"
            onClick={() => console.log("CREATE OPT!")}
          >
            <span>Create &quot;{text}&quot;</span>
          </ComboboxOption>
        )}
        {options.map((option) => (
          <ComboboxOption
            value={option}
            key={option.id}
            className="cursor-pointer"
          >
            {(props) => renderOption(option, props)}
          </ComboboxOption>
        ))}
      </ComboboxOptions>
    </Combobox>
  );
}
