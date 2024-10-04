"use client";

import Spinner from "@/components/Spinner";
import { Combobox, Dialog, Transition } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { ComponentType, Fragment, useEffect, useState } from "react";

interface SearchComponentProps<T> {
  fetchOptions: (search: string) => Promise<T[]>;
  onOptionSelect: (option: T) => void;
  Option: ComponentType<{ data: T; active: boolean }>;
}

export default function SearchComponent<T extends { id: string }>({
  fetchOptions,
  Option,
  onOptionSelect,
}: SearchComponentProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<T[]>([]);

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
      const res = await fetchOptions(search);
      setLoading(false);
      setOptions(res);
    }

    if (search) {
      fetchOptionsAsync();
    }
  }, [search, fetchOptions]);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="cursor-pointer px-4 rounded-full border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 flex items-center text-gray-500"
      >
        <MagnifyingGlassIcon className="h-6 w-6 mr-2" />
        Search...
      </div>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          onClose={setOpen}
          className="fixed inset-0 p-4 pt-[25vh] overflow-y-auto"
        >
          <Transition.Child
            enter="duration-300 ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="duration-200 ease-in"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black/25" />
          </Transition.Child>
          <Transition.Child
            enter="duration-300 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Combobox
              onChange={(val: T) => {
                setOpen(false);
                setSearch("");
                onOptionSelect(val);
              }}
              as="div"
              className="relative bg-white max-w-xl mx-auto rounded-xl shadow-2xl ring-1 ring-black/5 divide-y overflow-hidden"
            >
              <div className="px-4 flex items-center">
                <MagnifyingGlassIcon className="h-6 w-6 text-gray-500" />
                <Combobox.Input
                  autoComplete="off"
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-900 placeholder:text-gray-400 h-12"
                  placeholder="Search..."
                  displayValue={() => ""}
                />
                {loading && <Spinner />}
              </div>
              {options.length !== 0 && !loading && (
                <Combobox.Options
                  static
                  className="py-4 text-sm max-h-96 overflow-y-auto"
                >
                  {options.map((option) => (
                    <Combobox.Option value={option} key={option.id}>
                      {({ active }) => <Option data={option} active={active} />}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              )}
              {search && options.length === 0 && (
                <p className="p-4 text-sm text-gray-500">No results found.</p>
              )}
            </Combobox>
          </Transition.Child>
        </Dialog>
      </Transition.Root>
    </>
  );
}
