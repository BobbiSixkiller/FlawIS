"use client";

import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import { Fragment, ReactNode } from "react";

interface DropdownProps {
  trigger: ReactNode;
  items: { label: string; href: string; icon?: ReactNode }[];
}

export default function Dropdown({ trigger, items }: DropdownProps) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="px-2 py-1 rounded-md hover:bg-gray-700 hover:bg-opacity-10 outline-none	focus:ring-2 focus:ring-inset focus:ring-primary-500">
        {trigger}
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={`absolute
             right-0 mt-2 min-w-max w-32 origin-top-right
          rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-10`}
        >
          {items.map((item, i) => (
            <div className="p-1" key={i}>
              <Menu.Item>
                {({ active, close }) => (
                  <Link
                    scroll={false}
                    onClick={close}
                    href={item.href}
                    className={`${
                      active ? "bg-primary-500 text-white" : "text-gray-900"
                    } flex gap-2 w-full items-center rounded-md text-sm p-2`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                )}
              </Menu.Item>
            </div>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
