"use client";

import { Billing, UserFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Transition,
} from "@headlessui/react";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";
import { ChangeEvent, Fragment, useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

export default function BillingInput({
  billings,
}: {
  billings?: UserFragment["billings"];
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState(false);
  const { lng } = useParams<{ lng: string }>();

  const { t } = useTranslation(lng, ["conferences", "common"]);

  const { watch, setValue, getFieldState, register } = useFormContext();
  const { error } = getFieldState("billing.name");

  useEffect(() => {
    if (error) {
      setTimeout(() => ref.current?.focus(), 0);
    }
  }, [error]);

  const filteredBillings =
    query === ""
      ? billings
      : billings?.filter((billing) =>
          billing?.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  function compareBillings(a: Billing, b: Billing) {
    return a.name.toLowerCase() === b.name.toLowerCase();
  }

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    if (filteredBillings && filteredBillings.length === 0) {
      setValue("billing.name", event.target.value, { shouldValidate: true });
    }
  };

  return (
    <div>
      <label
        htmlFor="billing.name"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        {t("registration.billing.name")}
      </label>
      <Combobox
        {...register("billing.name")}
        value={watch("billing")}
        onChange={(val) => setValue("billing", val)}
        by={compareBillings}
      >
        <div className="relative mt-2">
          <div
            className={`flex gap-1 w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 ${
              focus ? "ring-primary-500 ring-2" : ""
            } ${error ? "ring-red-500" : ""} shadow-sm`}
          >
            <ComboboxInput
              ref={ref}
              className="w-full border-none rounded-r-none rounded-l-md py-1.5 placeholder:text-gray-400 focus:ring-transparent sm:text-sm sm:leading-6"
              displayValue={(billing: Billing) => billing?.name}
              onChange={handleInput}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              id="billing.name"
            />
            <div className="flex">
              {watch("billing.name") && (
                <button
                  className="p-2 hover:text-primary-500 text-gray-400"
                  onClick={() => {
                    setValue("billing.name", "");
                    setValue("billing.address.street", "");
                    setValue("billing.address.city", "");
                    setValue("billing.address.postal", "");
                    setValue("billing.address.country", "");
                    setValue("billing.ICO", "");
                    setValue("billing.DIC", "");
                    setValue("billing.ICDPH", "");
                  }}
                >
                  <XMarkIcon className="size-3" />
                </button>
              )}
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
          </div>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ComboboxOptions className="empty:invisible absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
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
                        focus ? "bg-primary-600 text-white" : "text-gray-900"
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
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
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
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
}
