"use client";

import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Field,
  Label,
} from "@headlessui/react";
import { useEffect, useRef, useState, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";
import { last } from "lodash";
import { Control, useController } from "react-hook-form";
import Spinner from "./Spinner";
import { cn } from "@/utils/helpers";
import useWidth from "@/hooks/useWidth";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { withLocalizedInput } from "./withLocalizedInput";

export interface GenericComboboxProps<TOption, TValue> {
  lng: string;
  name: string;
  control: Control<any>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  defaultOptions: TOption[];
  multiple?: boolean;
  immediate?: boolean;
  fetchOptions?: (query: string) => Promise<TOption[]>;
  createOption?: (text: string) => Promise<TOption>;
  renderOption: (
    option: TOption,
    props: { focus: boolean; selected: boolean }
  ) => React.ReactElement;
  getOptionLabel: (opt: TOption) => string;
  getOptionValue: (opt: TOption | null) => TValue;
  allowCreateNewOptions?: boolean;
  onFocus?: () => void; // So withLocalizedInput HOC works
  onClick?: () => void;
}

export default function GenericCombobox<
  TOption extends { id: string | number; val: any },
  TValue
>({
  name,
  control,
  label,
  placeholder,
  disabled,
  multiple,
  immediate,
  defaultOptions,
  fetchOptions,
  createOption,
  renderOption,
  getOptionLabel,
  getOptionValue,
  allowCreateNewOptions,
  ...props
}: GenericComboboxProps<TOption, TValue>) {
  const ref = useRef<HTMLDivElement>(null);
  const width = useWidth();
  const [boxRect, setBoxRect] = useState<DOMRect>();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<TOption[]>(defaultOptions);

  const { field, fieldState } = useController({ name, control });

  // Transform form value (primitive or object) to TOption(s)
  const value: TOption[] = useMemo(() => {
    if (multiple) {
      const arr = Array.isArray(field.value) ? field.value : [];
      return arr.map((v, i) =>
        typeof v === "object" && v !== null && "id" in v
          ? (v as TOption)
          : ({ id: i, val: v } as TOption)
      );
    } else {
      if (!field.value) return [];
      return typeof field.value === "object" &&
        field.value !== null &&
        "id" in field.value
        ? [field.value as TOption]
        : [{ id: 0, val: field.value } as TOption];
    }
  }, [field.value, multiple]);

  // Debounced search input
  const debounced = useDebouncedCallback(
    (value: string) => {
      setText(value);
    },
    fetchOptions ? 500 : 0
  );

  // Fetch or filter options
  useEffect(() => {
    async function getOrFilterOptions() {
      if (fetchOptions && text) {
        setLoading(true);
        const res = await fetchOptions(text);
        setOptions(res);
        setLoading(false);
      } else {
        const filtered =
          text === ""
            ? defaultOptions
            : defaultOptions.filter((opt) =>
                getOptionLabel(opt).toLowerCase().includes(text.toLowerCase())
              );
        setOptions(filtered);
      }
    }
    getOrFilterOptions();
  }, [text, fetchOptions, defaultOptions, getOptionLabel]);

  // Track combobox width
  useEffect(() => {
    function updateRect() {
      if (ref.current) {
        setBoxRect(ref.current.getBoundingClientRect());
      }
    }

    updateRect();

    document
      .querySelector("#modal-scroll-container")
      ?.addEventListener("scroll", updateRect, { passive: true });

    return () => {
      document
        .querySelector("#modal-scroll-container")
        ?.removeEventListener("scroll", updateRect);
    };
  }, [width, field.value]);

  async function handleChange(newValue: TOption | TOption[] | null) {
    if (Array.isArray(newValue)) {
      // Creating a new option
      if (createOption && !last(newValue)?.id) {
        const newOpt = await createOption(last(newValue)!.val);
        field.onChange([
          ...newValue.slice(0, newValue.length - 1).map(getOptionValue),
          getOptionValue(newOpt),
        ]);
      } else {
        field.onChange(newValue.map(getOptionValue));
      }
    } else {
      if (createOption && !newValue?.id) {
        const newOpt = await createOption(newValue?.val);
        field.onChange(getOptionValue(newOpt));
      } else {
        field.onChange(getOptionValue(newValue));
      }
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      event.key === "Backspace" &&
      text === "" &&
      Array.isArray(field.value)
    ) {
      // Prevent the default backspace behavior
      event.preventDefault();
      field.onChange(field.value.slice(0, -1));
    }
  };

  function renderComboboxContent() {
    return (
      <div>
        <div
          className={cn([
            "min-h-9 py-1 pl-2.5 flex flex-wrap gap-1 w-full rounded-md border-0 ring-gray-300 shadow-sm sm:text-sm sm:leading-6",
            "dark:bg-gray-800 dark:ring-gray-600 text-gray-900 dark:text-white",
            "ring-1 focus-within:ring-2",
            fieldState.error
              ? "ring-red-500 dark:ring-red-500 focus:ring-red-500 dark:focus:ring-red-500"
              : "focus-within:ring-primary-500 dark:focus-within:ring-primary-300",
            disabled
              ? "text-slate-500 bg-slate-100 ring-slate-200 dark:bg-gray-800 dark:ring-gray-600 dark:text-slate-500 focus-within:ring-transparent"
              : "bg-white text-gray-900",
          ])}
        >
          {multiple &&
            value.map((val, i) => (
              <div
                key={val.id}
                className={cn([
                  "flex gap-1 whitespace-nowrap rounded-md bg-gray-300 dark:bg-gray-600 dark:text-white px-1 h-7 items-center",
                  fieldState.error &&
                    Array.isArray(fieldState.error) &&
                    fieldState.error[i] &&
                    "bg-red-300 dark:bg-red-300 text-red-500 dark:text-red-500",
                ])}
              >
                {getOptionLabel(val)}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    field.onChange(
                      value
                        .filter((i) => i.id !== val.id)
                        .map((v) => getOptionValue(v))
                    )
                  }
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </div>
            ))}

          <div className="flex flex-1">
            <ComboboxInput
              placeholder={placeholder}
              onChange={(e) => debounced(e.target.value)}
              displayValue={() => ""}
              className="bg-transparent border-none focus:ring-0 p-0 w-full"
              onKeyDown={handleKeyDown}
              disabled={disabled}
            />
            {loading ? (
              <Spinner />
            ) : (
              <ComboboxButton className="p-2 text-gray-400">
                {({ open }) =>
                  open ? (
                    <ChevronUpIcon className="size-3" />
                  ) : (
                    <ChevronDownIcon className="size-3" />
                  )
                }
              </ComboboxButton>
            )}
          </div>
        </div>

        <ComboboxOptions
          style={{
            width: boxRect?.width,
            left: boxRect?.left,
            top: Number(boxRect?.top) + Number(boxRect?.height),
          }}
          transition
          className={cn([
            "fixed mt-2 border transition origin-top duration-200 ease-out empty:invisible data-closed:scale-95 data-closed:opacity-0",
            "top-0 z-50 overflow-auto max-h-40 empty:invisible rounded-md bg-white text-gray-900 shadow-lg ring-1 ring-black/5 focus:outline-none",
            "dark:bg-gray-600 dark:text-white/85 dark:border-gray-700",
          ])}
        >
          {allowCreateNewOptions && text.length > 0 && (
            <ComboboxOption
              value={{ id: null, val: text } as unknown as TOption}
              className="data-[focus]:bg-primary-500 dark:data-[focus]:bg-primary-300 p-2 cursor-pointer"
            >
              Create &quot;{text}&quot;
            </ComboboxOption>
          )}
          {options.map((opt, i) => (
            <ComboboxOption
              key={i}
              value={opt}
              className="data-[focus]:bg-primary-500 dark:data-[focus]:bg-primary-300 p-2 cursor-pointer"
            >
              {(props) => renderOption(opt, props)}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </div>
    );
  }

  return (
    <Field {...props}>
      {label && (
        <Label className="block mb-2 text-sm font-medium leading-6 text-gray-900 dark:text-white">
          {label}
        </Label>
      )}

      {multiple ? (
        <Combobox
          multiple
          immediate={immediate}
          value={value}
          onChange={handleChange}
          onClose={() => setText("")}
          ref={ref}
        >
          {renderComboboxContent()}
        </Combobox>
      ) : (
        <Combobox
          immediate={immediate}
          value={value[0] ?? undefined}
          onChange={handleChange}
          onClose={() => setText("")}
        >
          {renderComboboxContent()}
        </Combobox>
      )}

      {fieldState.error && (
        <p className="text-sm text-red-500">
          {!Array.isArray(fieldState.error)
            ? fieldState.error?.message
            : fieldState.error.map((err) => err.message).join(" ")}
        </p>
      )}
    </Field>
  );
}

export const LocalizedGenericCombobox = withLocalizedInput(GenericCombobox);
