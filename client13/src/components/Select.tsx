"use client";

import { Fragment, useEffect, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useFormContext } from "react-hook-form";

export default function Select({
  label,
  name,
  options,
  defaultSelected,
  disabled = false,
}: {
  disabled?: boolean;
  label?: string;
  name: string;
  options: { name: string; value: any }[];
  defaultSelected?: string;
}) {
  const [selected, setSelected] = useState(
    options.find((o) => o.value === defaultSelected) || options[0]
  );

  const { setValue } = useFormContext();
  useEffect(() => {
    setValue(name, selected.value);
  }, [selected]);

  return (
    <Listbox
      disabled={disabled}
      as="div"
      name={name}
      value={selected}
      onChange={setSelected}
    >
      {label && (
        <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
          {label}
        </Listbox.Label>
      )}
      <div className="relative">
        <Listbox.Button
          className={`block w-full rounded-md border-0 py-1.5 ${
            disabled ? "text-slate-500 bg-slate-100" : "text-gray-900"
          } ring-1 ring-inset ring-gray-300 shadow-sm focus:outline-primary-500 sm:text-sm sm:leading-6`}
        >
          <span className="block truncate">{selected.name}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="z-10 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
            {options.map((o, i) => (
              <Listbox.Option
                key={i}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? "bg-primary-100 text-primary-900" : "text-gray-900"
                  }`
                }
                value={o}
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? "font-medium" : "font-normal"
                      }`}
                    >
                      {o.name}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-500">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
