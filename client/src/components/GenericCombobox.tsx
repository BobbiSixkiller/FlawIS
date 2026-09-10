"use client";

import Icon from "@/components/Icon";
import { cn } from "@/lib/utilsClient";
import { GqlMutationResponse } from "@/lib/graphql/actions";
import { useTranslation } from "@/lib/i18n/client";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { isEqual, last } from "lodash";
import { useParams } from "next/navigation";
import {
  type AriaAttributes,
  type Ref,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDebouncedCallback } from "use-debounce";
import Spinner from "./Spinner";

export interface GenericComboboxProps<TOption, TValue> extends AriaAttributes {
  lng: string;
  name: string;
  value?: TValue | TValue[] | null;
  onChange: (value: TValue | TValue[]) => void;
  onBlur?: () => void;
  id?: string;
  ref?: Ref<HTMLInputElement>;
  onError?: (message: string, errors?: Record<string, string>) => void;
  itemErrors?: Record<number, string>;
  placeholder?: string;
  disabled?: boolean;
  defaultOptions: TOption[];
  multiple?: boolean;
  immediate?: boolean;
  displayValue?: (val: TOption) => string;
  fetchOptions?: (query: string) => Promise<TOption[]>;
  createOption?: (text: string) => Promise<GqlMutationResponse<TOption>>;
  renderOption: (
    option: TOption,
    props: { focus: boolean; selected: boolean },
  ) => React.ReactElement;
  getOptionLabel: (opt: TOption) => string;
  getOptionValue: (opt: TOption | null) => TValue;
  allowCreateNewOptions?: boolean;
  onFocus?: () => void;
  onClick?: () => void;
}

export default function GenericCombobox<
  TOption extends { id: string | number; val: any },
  TValue,
>({
  lng,
  name,
  value: fieldValue,
  onChange,
  onError,
  itemErrors,
  ref,
  placeholder,
  disabled,
  multiple,
  immediate,
  defaultOptions,
  displayValue,
  fetchOptions,
  createOption,
  renderOption,
  getOptionLabel,
  getOptionValue,
  allowCreateNewOptions,
  ...props
}: GenericComboboxProps<TOption, TValue>) {
  const { lng: uiLng } = useParams<{ lng: string }>();
  const [text, setText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<TOption[]>(defaultOptions);

  // Transform form value (primitive or object) to TOption(s)
  const value: TOption[] = useMemo(() => {
    if (multiple) {
      const arr = Array.isArray(fieldValue) ? fieldValue : [];
      return arr.map((v, i) =>
        typeof v === "object" && v !== null && "id" in v
          ? (v as TOption)
          : ({ id: i, val: v } as TOption),
      );
    } else {
      if (!fieldValue) return [];
      return typeof fieldValue === "object" &&
        fieldValue !== null &&
        "id" in fieldValue
        ? [fieldValue as TOption]
        : [{ id: 0, val: fieldValue } as TOption];
    }
  }, [fieldValue, multiple]);

  // Debounced search input
  const debounced = useDebouncedCallback((value: string) => {
    setSearchText(value);
  }, 500);

  function handleQueryChange(value: string) {
    setText(value);

    if (fetchOptions) {
      debounced(value);
    } else {
      setSearchText(value);
    }
  }

  function clearQuery() {
    debounced.cancel();
    setText("");
    setSearchText("");
  }

  // Fetch or filter options
  useEffect(() => {
    async function getOrFilterOptions() {
      if (fetchOptions && searchText) {
        setLoading(true);
        const res = await fetchOptions(searchText);
        setOptions(res);
        setLoading(false);
      } else {
        const filtered =
          searchText === ""
            ? defaultOptions
            : defaultOptions.filter((opt) =>
                getOptionLabel(opt)
                  .toLowerCase()
                  .includes(searchText.toLowerCase()),
              );
        setOptions(filtered);
      }
    }
    getOrFilterOptions();
  }, [searchText, fetchOptions, defaultOptions, getOptionLabel]);

  async function handleChange(newValue: TOption | TOption[] | null) {
    if (Array.isArray(newValue)) {
      // Creating a new option
      if (createOption && newValue.length > 0 && last(newValue)?.id == null) {
        setLoading(true);
        const res = await createOption(last(newValue)!.val);
        if (res.data) {
          onChange([
            ...newValue.slice(0, newValue.length - 1).map(getOptionValue),
            getOptionValue(res.data),
          ]);
          clearQuery();
        }
        if (!res.success) {
          onError?.(res.message, res.errors);
        }
        setLoading(false);
      } else {
        onChange(newValue.map(getOptionValue));
        clearQuery();
      }
    } else {
      if (createOption && newValue && newValue.id == null) {
        setLoading(true);
        const res = await createOption(newValue?.val);
        if (res.data) {
          onChange(getOptionValue(res.data));
        }
        if (!res.success) {
          onError?.(res.message, res.errors);
        }
        setLoading(false);
      } else {
        onChange(getOptionValue(newValue));
      }
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && text === "" && Array.isArray(fieldValue)) {
      // Prevent the default backspace behavior
      event.preventDefault();
      onChange(fieldValue.slice(0, -1));
    }
  };

  const { t } = useTranslation(uiLng, "common");

  function renderComboboxContent() {
    return (
      <div className="relative">
        <div
          className={cn([
            "min-h-9 py-1 pl-2.5 flex flex-wrap gap-1 w-full rounded-md border-0 ring-gray-300 shadow-xs sm:text-sm sm:leading-6",
            "dark:bg-gray-800 dark:ring-gray-600 text-gray-900 dark:text-white",
            "ring-1 focus-within:ring-2",
            props["aria-invalid"]
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
                  itemErrors?.[i] &&
                    "bg-red-300 dark:bg-red-300 text-red-500 dark:text-red-500",
                ])}
              >
                {getOptionLabel(val)}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    onChange(
                      value
                        .filter((i) => i.id !== val.id)
                        .map((v) => getOptionValue(v)),
                    )
                  }
                >
                  <Icon name="x-mark" className="h-3 w-3" />
                </button>
              </div>
            ))}

          <div className="flex flex-1">
            <ComboboxInput
              {...props}
              ref={ref}
              name={name}
              placeholder={placeholder}
              onChange={(e) => handleQueryChange(e.target.value)}
              {...(multiple ? { value: text } : {})}
              displayValue={(option: TOption) => {
                if (multiple || !option) return "";
                if (displayValue) return displayValue(option);
                const { val } = option;
                const selected = options.find((o) =>
                  Object.values(o.val).some((v) => isEqual(v, val)),
                );
                return selected
                  ? getOptionLabel(selected)
                  : getOptionLabel(option);
              }}
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
                    <Icon name="chevron-up" className="size-3" />
                  ) : (
                    <Icon name="chevron-down" className="size-3" />
                  )
                }
              </ComboboxButton>
            )}
          </div>
        </div>

        <ComboboxOptions
          transition
          className={cn([
            "absolute left-0 top-full mt-2 w-full border transition origin-top duration-200 ease-out empty:invisible data-closed:scale-95 data-closed:opacity-0",
            "z-50 overflow-auto max-h-40 empty:invisible rounded-md bg-white text-gray-900 shadow-lg ring-1 ring-black/5 focus:outline-hidden",
            "dark:bg-gray-600 dark:text-white/85 dark:border-gray-700",
          ])}
        >
          {allowCreateNewOptions && text.length > 0 && (
            <ComboboxOption
              value={{ id: null, val: text } as unknown as TOption}
              className="data-focus:bg-primary-500 dark:data-focus:bg-primary-300 data-focus:text-white p-2 cursor-pointer"
            >
              {t("addOption", { value: text })}
            </ComboboxOption>
          )}
          {options.map((opt, i) => (
            <ComboboxOption
              key={i}
              value={opt}
              className="data-focus:bg-primary-500 dark:data-focus:bg-primary-300 data-focus:text-white p-2 cursor-pointer"
            >
              {(props) => renderOption(opt, props)}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </div>
    );
  }

  return (
    <>
      {multiple ? (
        <Combobox
          multiple
          disabled={disabled}
          immediate={immediate}
          value={value}
          onChange={handleChange}
        >
          {renderComboboxContent()}
        </Combobox>
      ) : (
        <Combobox
          disabled={disabled}
          immediate={immediate}
          value={value[0] ?? undefined}
          onChange={handleChange}
          onClose={() => setText("")}
        >
          {renderComboboxContent()}
        </Combobox>
      )}
    </>
  );
}
