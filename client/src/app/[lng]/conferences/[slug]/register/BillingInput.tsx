"use client";

import Icon from "@/components/Icon";
import { cn } from "@/lib/utilsClient";
import { BillingInput, UserFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Transition,
} from "@headlessui/react";
import { useParams } from "next/navigation";
import {
  ChangeEvent,
  Fragment,
  useState,
  type AriaAttributes,
  type Ref,
} from "react";

export default function ConferenceBillingInput({
  billings,
  value,
  onNameChange,
  onSelect,
  onClear,
  ref,
  ...props
}: AriaAttributes & {
  billings?: UserFragment["billings"];
  value?: BillingInput | null;
  onNameChange: (name: string) => void;
  onSelect: (billing: BillingInput) => void;
  onClear: () => void;
  id?: string;
  onBlur?: () => void;
  ref?: Ref<HTMLInputElement>;
}) {
  const [query, setQuery] = useState("");
  const { lng } = useParams<{ lng: string }>();

  const { t } = useTranslation(lng, ["conferences", "common"]);

  const filteredBillings =
    query === ""
      ? billings
      : billings?.filter((billing) =>
          billing?.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, "")),
        );

  function compareBillings(a?: BillingInput | null, b?: BillingInput | null) {
    return a?.name.toLowerCase() === b?.name.toLowerCase();
  }

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    onNameChange(event.target.value);
  };

  return (
    <div>
      <Combobox
        immediate
        value={value}
        onChange={(val) => (val ? onSelect(val) : null)}
        by={compareBillings}
      >
        <div className="relative mt-2">
          <div
            className={cn([
              "flex gap-1 w-full rounded-md border-0 text-gray-900 ring-1 ring-gray-300 focus-within:ring-2 shadow-xs",
              "dark:bg-gray-800 dark:ring-gray-600 dark:text-white",
              props["aria-invalid"]
                ? "ring-red-500 dark:ring-red-500 focus-within:ring-red-500"
                : "focus-within:ring-primary-500",
            ])}
          >
            <ComboboxInput
              {...props}
              ref={ref}
              className={cn([
                "w-full border-none rounded-r-none rounded-l-md py-1.5 bg-transparent placeholder:text-gray-400 focus:ring-transparent sm:text-sm sm:leading-6",
              ])}
              displayValue={(billing: BillingInput) => billing?.name}
              onChange={handleInput}
            />
            <div className="flex">
              {value?.name && (
                <button
                  className="p-2 hover:text-primary-500 text-gray-400"
                  type="button"
                  aria-label={t("clear", { ns: "common" })}
                  onClick={onClear}
                >
                  <Icon name="x-mark" className="size-3" />
                </button>
              )}
              <ComboboxButton className="p-2 text-gray-400">
                {({ open }) =>
                  open ? (
                    <Icon
                      name="chevron-up"
                      className="size-3"
                      aria-hidden="true"
                    />
                  ) : (
                    <Icon
                      name="chevron-down"
                      className="size-3"
                      aria-hidden="true"
                    />
                  )
                }
              </ComboboxButton>
            </div>
          </div>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ComboboxOptions
              className={cn([
                "empty:invisible absolute mt-2 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-hidden text-gray-900 sm:text-sm",
                "dark:bg-gray-700 dark:text-white dark:ring-gray-700",
              ])}
            >
              {filteredBillings?.length === 0 && query !== "" ? (
                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                  {t("notFound", { ns: "common" })}
                </div>
              ) : (
                filteredBillings?.map((billing, i) => (
                  <ComboboxOption
                    key={i}
                    className={({ focus }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        focus ? "bg-primary-600 text-white" : ""
                      }`
                    }
                    value={billing}
                  >
                    {({ selected, focus }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {billing?.name}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              focus ? "text-white" : "text-primary-600"
                            }`}
                          >
                            <Icon
                              name="check"
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </span>
                        ) : null}
                      </>
                    )}
                  </ComboboxOption>
                ))
              )}
            </ComboboxOptions>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
}
