"use client";

import { Fragment, useEffect, useState } from "react";
import { Combobox, Dialog, Transition } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { searchUser } from "@/app/[lng]/(dashboard)/users/actions";
import { useRouter } from "next/navigation";
import Spinner from "./Spinner";

export default function Search() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<
    { id: string; name: string; email: string }[]
  >([]);

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
    async function fetchOptions() {
      setLoading(true);
      const res = await searchUser(search);
      setLoading(false);
      if (res.success && res.data) {
        setOptions(res.data);
      } else {
        setOptions([]);
      }
    }

    if (search) {
      fetchOptions();
    }
  }, [search]);

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
              onChange={(val: { id: string; name: string; email: string }) => {
                setOpen(false);
                setSearch("");
                router.push(`/users/${val.id}`);
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
                  {options.map((o) => (
                    <Combobox.Option value={o} key={o.id}>
                      {(props) => (
                        <div
                          className={`px-4 py-2 ${
                            props.active
                              ? "bg-primary-500 text-white"
                              : "bg-white"
                          } flex gap-2 font-semibold cursor-pointer`}
                        >
                          {o.name + " "}
                          <span
                            className={`font-normal ${
                              props.active ? "text-gray-200" : "text-gray-500"
                            }`}
                          >
                            {o.email}
                          </span>
                        </div>
                      )}
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
