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
import {
  cloneElement,
  Fragment,
  isValidElement,
  ReactElement,
  ReactNode,
} from "react";

interface CustomDropdownElementProps {
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export type DropdownItem =
  | { type: "link"; text: string; href: string; icon?: ReactNode }
  | { type: "custom"; element: ReactElement<CustomDropdownElementProps> };

interface DropdownProps {
  className?: string;
  trigger: ReactNode;
  items: DropdownItem[];
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
          as="div"
          className={cn([
            positionSettings ? positionSettings : "mt-2 right-0",
            "absolute min-w-max whitespace-nowrap rounded-md bg-white text-gray-900 shadow-lg ring-1 ring-black/5 focus:outline-none z-10",
            "dark:bg-gray-700 dark:text-white/85",
          ])}
        >
          {items.map((item, i) => (
            <div className="p-1" key={i}>
              <MenuItem as={Fragment}>
                {({ close, focus }) => {
                  if (item.type === "custom" && isValidElement(item.element)) {
                    return cloneElement(item.element, {
                      className: cn([
                        "flex gap-2 items-center rounded-md text-sm p-2",
                        focus &&
                          "bg-primary-500 dark:bg-primary-300/90 dark:text-gray-900 text-white",
                        item.element.props?.className,
                      ]),
                      onClick: (e: React.MouseEvent) => {
                        item.element.props.onClick?.(e);
                        close(); // close dropdown after click
                      },
                    });
                  }

                  if (item.type === "link") {
                    return (
                      <Link
                        scroll={false}
                        onClick={close}
                        href={item.href}
                        className={`${
                          focus
                            ? "bg-primary-500 dark:bg-primary-300/90 dark:text-gray-900 text-white"
                            : ""
                        } flex gap-2 items-center rounded-md text-sm p-2`}
                      >
                        {item.icon}
                        {item.text}
                      </Link>
                    );
                  }

                  return (
                    <div className="text-sm p-2 text-red-500">Invalid item</div>
                  );
                }}
              </MenuItem>
            </div>
          ))}
        </MenuItems>
      </Transition>
    </Menu>
  );
}
