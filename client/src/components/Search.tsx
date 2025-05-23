"use client";

import Spinner from "@/components/Spinner";
import { cn } from "@/utils/helpers";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { ComponentType, Fragment, useEffect, useState } from "react";

interface BaseSearchParams {
  text: string;
}

interface SearchComponentProps<TOption, TParams extends BaseSearchParams> {
  fetchOptions: (params: TParams) => Promise<TOption[]>;
  onOptionSelect: (option: TOption) => void;
  Option: ComponentType<{ data: TOption; active: boolean }>;
}

export default function SearchComponent<
  TOption extends { id: string },
  TParams extends { text: string }
>({
  fetchOptions,
  Option,
  onOptionSelect,
}: SearchComponentProps<TOption, TParams>) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<TOption[]>([]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "z" && (event.metaKey || event.ctrlKey)) {
        setOpen(!open);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    async function fetchOptionsAsync() {
      setLoading(true);
      const res = await fetchOptions({ text } as TParams);
      setLoading(false);
      setOptions(res);
    }

    if (text) {
      fetchOptionsAsync();
    }
  }, [text, fetchOptions]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn([
          "hover:text-primary-500 hover:ring-primary-500 outline-none focus:ring-2 focus:ring-primary-500",
          "px-4 rounded-full border-0 p-2 shadow-sm ring-1 ring-inset ring-gray-300 flex items-center text-gray-500",
          "dark:bg-gray-800 dark:ring-gray-600",
        ])}
      >
        <MagnifyingGlassIcon className="size-4 md:size-6" />
      </button>
      <Transition show={open} as={Fragment}>
        <Dialog
          as="div"
          onClose={() => setOpen(false)}
          className="z-10 fixed inset-0 p-4 pt-[25vh] overflow-y-auto"
        >
          <TransitionChild
            enter="duration-300 ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="duration-200 ease-in"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              // onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/25 z-10"
            />
          </TransitionChild>
          <TransitionChild
            enter="duration-300 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel as={Fragment}>
              <Combobox
                onChange={(val: TOption) => {
                  setOpen(false);
                  setText("");
                  if (val) {
                    onOptionSelect(val);
                  }
                }}
                as="div"
                className={cn([
                  "z-20 relative bg-white max-w-xl mx-auto rounded-xl shadow-2xl ring-1 ring-black/5 divide-y dark:divide-gray-600 overflow-hidden",
                  "dark:bg-gray-800 dark:ring-gray-600",
                ])}
              >
                <div className="px-4 flex items-center">
                  <MagnifyingGlassIcon className="h-6 w-6 text-gray-500" />
                  <ComboboxInput
                    autoComplete="off"
                    autoFocus
                    onChange={(e) => setText(e.target.value)}
                    className={cn([
                      "w-full bg-transparent border-none focus:ring-0 text-sm text-gray-900 placeholder:text-gray-400 h-12",
                      "dark:text-white",
                    ])}
                    placeholder="Search..."
                    displayValue={() => ""}
                  />
                  {loading && <Spinner />}
                </div>
                {options.length !== 0 && !loading && (
                  <ComboboxOptions
                    static
                    className="py-4 text-sm max-h-96 overflow-y-auto"
                  >
                    {options.map((option) => (
                      <ComboboxOption value={option} key={option.id}>
                        {({ focus }) => <Option data={option} active={focus} />}
                      </ComboboxOption>
                    ))}
                  </ComboboxOptions>
                )}
                {text && options.length === 0 && (
                  <p className="p-4 text-sm text-gray-500">No results found.</p>
                )}
              </Combobox>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  );
}
