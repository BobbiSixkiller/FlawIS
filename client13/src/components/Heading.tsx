"use client";

import { Children, Fragment, ReactNode } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Menu, Transition } from "@headlessui/react";
import { useTranslation } from "@/lib/i18n/client";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Heading({
  heading,
  subHeading,
  links,
  lng,
}: {
  heading: string;
  subHeading?: ReactNode;
  links?: ReactNode;
  lng: string;
}) {
  const children = Children.toArray(links);
  const first = children.shift();

  const { t } = useTranslation(lng, "common");

  return (
    <div className="lg:flex lg:items-center lg:justify-between">
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          {heading}
        </h2>
        {subHeading && (
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6 text-gray-400 text-sm">
            {subHeading}
          </div>
        )}
      </div>
      <div className="mt-5 flex gap-3 lg:ml-4 lg:mt-0">
        {children.map((child, i) => (
          <span className="hidden sm:block" key={i}>
            <div className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              {child}
            </div>
          </span>
        ))}

        {first && (
          <span className="">
            <div className="inline-flex items-center rounded-md bg-primary-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">
              {first}
            </div>
          </span>
        )}

        {/* Dropdown */}
        {children.length > 0 && (
          <Menu as="div" className="relative sm:hidden">
            <Menu.Button className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-400">
              {t("more")}
              <ChevronDownIcon
                className="-mr-1 ml-1.5 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 -mr-1 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {children.map((action, i) => (
                  <Menu.Item key={i}>
                    {({ active }) => (
                      <div
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "text-sm text-gray-700"
                        )}
                      >
                        {action}
                      </div>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </Menu>
        )}
      </div>
    </div>
  );
}
