"use client";

import { cn } from "@/utils/helpers";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuItemsProps,
  Transition,
} from "@headlessui/react";
import { cloneElement, Fragment, ReactElement, ReactNode } from "react";

interface DropdownElementProps {
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export type DropdownItem = ReactElement<DropdownElementProps>;

interface DropdownProps {
  className?: string;
  trigger: ReactNode;
  items: DropdownItem[];
  anchor?: MenuItemsProps["anchor"];
}

export default function Dropdown({
  className,
  trigger,
  items,
  anchor,
}: DropdownProps) {
  return (
    <Menu as="div" className={className}>
      <MenuButton as={Fragment}>{trigger}</MenuButton>

      <MenuItems
        as="div"
        className={cn([
          "whitespace-nowrap rounded-md bg-white text-gray-900 shadow-lg ring-1 ring-black/5 focus:outline-none z-50",
          "dark:bg-gray-800 dark:text-white/85",
        ])}
        transition
        anchor={anchor}
      >
        {items.map((item, i) => (
          <div className="p-1" key={i}>
            <MenuItem as={Fragment}>
              {({ close, focus }) => {
                return cloneElement(item, {
                  className: cn([
                    "flex w-full gap-2 items-center rounded-md text-sm p-2",
                    focus &&
                      "bg-primary-500 dark:bg-primary-300/90 dark:text-gray-900 text-white",
                    // item.props?.className,
                  ]),
                  onClick: (e: React.MouseEvent) => {
                    item.props.onClick?.(e);
                    close(); // close dropdown after click
                  },
                });
              }}
            </MenuItem>
          </div>
        ))}
      </MenuItems>
    </Menu>
  );
}
