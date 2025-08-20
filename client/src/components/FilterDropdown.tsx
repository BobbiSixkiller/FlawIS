"use client";

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  PopoverPanelProps,
  Transition,
} from "@headlessui/react";
import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Fragment } from "react";
import { cn } from "@/utils/helpers";
import Button from "@/components/Button";
import Toggle from "@/components/Toggle";

type FilterConfig = {
  label: string;
  queryKey: string;
  type: "boolean" | "multi" | "single";
  options?: { value: string; label: string }[];
};

export default function FilterDropdown({
  filters,
  anchor,
}: {
  filters: FilterConfig[];
  anchor?: PopoverPanelProps["anchor"];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  function updateParams(modifier: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams);
    modifier(params);
    replace(`${pathname}?${params.toString()}`);
  }

  function toggleBoolean(key: string) {
    updateParams((params) => {
      if (params.get(key) === "true") {
        params.delete(key);
      } else {
        params.set(key, "true");
      }
    });
  }

  function toggleMulti(key: string, value: string) {
    updateParams((params) => {
      const current = params.getAll(key);
      params.delete(key);

      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      next.forEach((v) => params.append(key, v));
    });
  }

  function selectSingle(key: string, value: string) {
    updateParams((params) => {
      if (params.get(key) === value) {
        params.delete(key); // allow deselect
      } else {
        params.set(key, value);
      }
    });
  }

  return (
    <Popover>
      {({ open }) => (
        <>
          <PopoverButton as={Button} size="small" className="p-2">
            {open ? (
              <XMarkIcon className="size-5" />
            ) : (
              <FunnelIcon className="size-5" />
            )}
          </PopoverButton>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <PopoverPanel
              anchor={anchor}
              className={cn([
                "p-3 mx-4 sm:m-0 sm:w-96 [--anchor-gap:4px] sm:[--anchor-gap:8px] flex flex-col gap-1 rounded-lg shadow-lg ring-1 ring-black/5 bg-white overflow-auto !max-h-56 text-gray-900 text-sm",
                "dark:bg-gray-800 dark:text-white",
              ])}
            >
              {filters.map((filter) => {
                const currentMulti = searchParams.getAll(filter.queryKey);
                const currentSingle = searchParams.get(filter.queryKey);

                if (filter.type === "boolean") {
                  return (
                    <div
                      key={filter.queryKey}
                      className="flex items-center justify-between"
                    >
                      {filter.label}
                      <Toggle
                        defaultChecked={
                          searchParams.get(filter.queryKey) === "true"
                        }
                        handleToggle={() => toggleBoolean(filter.queryKey)}
                      />
                    </div>
                  );
                }

                if (filter.type === "multi" && filter.options) {
                  return (
                    <div key={filter.queryKey} className="pt-2">
                      <div className="font-bold text-base">{filter.label}</div>
                      {filter.options.map((opt) => (
                        <div
                          key={`${filter.queryKey}-${opt.value}`}
                          className="flex items-center justify-between pt-2"
                        >
                          {opt.label}
                          <Toggle
                            defaultChecked={currentMulti.includes(opt.value)}
                            handleToggle={() =>
                              toggleMulti(filter.queryKey, opt.value)
                            }
                          />
                        </div>
                      ))}
                      {filter.options.map((opt) => (
                        <div
                          key={`${filter.queryKey}-${opt.value}`}
                          className="flex items-center justify-between pt-2"
                        >
                          {opt.label}
                          <Toggle
                            defaultChecked={currentMulti.includes(opt.value)}
                            handleToggle={() =>
                              toggleMulti(filter.queryKey, opt.value)
                            }
                          />
                        </div>
                      ))}
                      {filter.options.map((opt) => (
                        <div
                          key={`${filter.queryKey}-${opt.value}`}
                          className="flex items-center justify-between pt-2"
                        >
                          {opt.label}
                          <Toggle
                            defaultChecked={currentMulti.includes(opt.value)}
                            handleToggle={() =>
                              toggleMulti(filter.queryKey, opt.value)
                            }
                          />
                        </div>
                      ))}
                      {filter.options.map((opt) => (
                        <div
                          key={`${filter.queryKey}-${opt.value}`}
                          className="flex items-center justify-between pt-2"
                        >
                          {opt.label}
                          <Toggle
                            defaultChecked={currentMulti.includes(opt.value)}
                            handleToggle={() =>
                              toggleMulti(filter.queryKey, opt.value)
                            }
                          />
                        </div>
                      ))}
                      {filter.options.map((opt) => (
                        <div
                          key={`${filter.queryKey}-${opt.value}`}
                          className="flex items-center justify-between pt-2"
                        >
                          {opt.label}
                          <Toggle
                            defaultChecked={currentMulti.includes(opt.value)}
                            handleToggle={() =>
                              toggleMulti(filter.queryKey, opt.value)
                            }
                          />
                        </div>
                      ))}
                      {filter.options.map((opt) => (
                        <div
                          key={`${filter.queryKey}-${opt.value}`}
                          className="flex items-center justify-between pt-2"
                        >
                          {opt.label}
                          <Toggle
                            defaultChecked={currentMulti.includes(opt.value)}
                            handleToggle={() =>
                              toggleMulti(filter.queryKey, opt.value)
                            }
                          />
                        </div>
                      ))}
                      {filter.options.map((opt) => (
                        <div
                          key={`${filter.queryKey}-${opt.value}`}
                          className="flex items-center justify-between pt-2"
                        >
                          {opt.label}
                          <Toggle
                            defaultChecked={currentMulti.includes(opt.value)}
                            handleToggle={() =>
                              toggleMulti(filter.queryKey, opt.value)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  );
                }

                if (filter.type === "single" && filter.options) {
                  return (
                    <div key={filter.queryKey} className="border-t pt-2">
                      <div className="font-medium mb-1">{filter.label}</div>
                      <div className="space-y-1">
                        {filter.options.map((opt) => {
                          const isActive = currentSingle === opt.value;
                          return (
                            <button
                              key={`${filter.queryKey}-${opt.value}`}
                              onClick={() =>
                                selectSingle(filter.queryKey, opt.value)
                              }
                              className={cn([
                                "w-full text-left text-sm px-2 py-1 rounded",
                                isActive
                                  ? "bg-primary-500 text-white"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-600",
                              ])}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
