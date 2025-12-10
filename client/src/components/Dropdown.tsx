"use client";

import { cn } from "@/utils/helpers";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuItemsProps,
} from "@headlessui/react";
import { cloneElement, Fragment, ReactElement, ReactNode } from "react";

interface DropdownElementProps {
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export type DropdownItem = ReactElement<DropdownElementProps>;

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  anchor?: MenuItemsProps["anchor"];
  buttonWidth?: boolean;
}

export default function Dropdown({
  trigger,
  items,
  anchor,
  buttonWidth,
}: DropdownProps) {
  return (
    <Menu>
      <MenuButton as={Fragment}>{trigger}</MenuButton>

      <MenuItems
        as="div"
        className={cn([
          buttonWidth && "w-[var(--button-width)]",
          "whitespace-nowrap rounded-md bg-white text-gray-900 shadow-lg ring-1 ring-black/5 focus:outline-none z-50",
          "dark:bg-gray-800 dark:text-white/85",
          "origin-top transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0",
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
