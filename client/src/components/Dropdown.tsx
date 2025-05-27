"use client";

import { cn } from "@/utils/helpers";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import Link from "next/link";
import { Fragment, ReactNode } from "react";

interface DropdownProps {
  className?: string;
  trigger: ReactNode;
  items: { text: string; href: string; icon?: ReactNode }[];
  positionSettings?: string;
}

export default function Dropdown({
  className,
  trigger,
  items,
  positionSettings,
}: DropdownProps) {
  return (
    <Menu as="div" className={cn("relative", className)}>
      <MenuButton as={Fragment}>{trigger}</MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems
          className={cn([
            positionSettings ? positionSettings : "mt-2 right-0",
            "absolute whitespace-nowrap rounded-md bg-white text-gray-900 shadow-lg ring-1 ring-black/5 focus:outline-none z-10",
            "dark:bg-gray-700 dark:text-white/85",
          ])}
        >
          {items.map((item, i) => (
            <div className="p-1" key={i}>
              <MenuItem as="div">
                {({ close, focus }) => (
                  <Link
                    scroll={false}
                    onClick={close}
                    href={item.href}
                    className={`${
                      focus
                        ? "bg-primary-500 dark:bg-primary-300/90 dark:text-gray-900 text-white"
                        : ""
                    } flex gap-2 w-full items-center rounded-md text-sm p-2`}
                  >
                    {item.icon}
                    {item.text}
                  </Link>
                )}
              </MenuItem>
            </div>
          ))}
        </MenuItems>
      </Transition>
    </Menu>
  );
}
