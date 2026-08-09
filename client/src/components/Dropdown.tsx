"use client";

import { cn } from "@/lib/clientUtils";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuItemsProps,
} from "@headlessui/react";
import { ReactElement, ReactNode } from "react";
import Button, { ButtonProps } from "./Button";

export type DropdownItem = ReactElement;

interface DropdownProps {
  trigger: ReactNode;
  triggerProps?: ButtonProps;
  items: DropdownItem[];
  anchor?: MenuItemsProps["anchor"];
  buttonWidth?: boolean;
}

export default function Dropdown({
  trigger,
  triggerProps,
  items,
  anchor,
  buttonWidth,
}: DropdownProps) {
  return (
    <Menu>
      <MenuButton as={Button} {...triggerProps}>
        {trigger}
      </MenuButton>

      <MenuItems
        as="div"
        className={cn([
          buttonWidth && "w-(--button-width)",
          "whitespace-nowrap rounded-md bg-white text-gray-900 shadow-lg ring-1 ring-black/5 focus:outline-hidden z-50",
          "dark:bg-gray-800 dark:text-white/85",
          "origin-top transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0",
        ])}
        transition
        anchor={anchor}
      >
        {items.map((item, i) => (
          <div className="p-1" key={i}>
            <MenuItem>
              {({ close, focus }) => {
                return (
                  <div
                    className={cn([
                      "flex w-full gap-2 items-center rounded-md text-sm p-2",
                      focus &&
                        "bg-primary-500 dark:bg-primary-300/90 dark:text-gray-900 text-white",
                      "[&>*]:flex [&>*]:w-full [&>*]:items-center [&>*]:gap-2",
                      "[&_button]:h-auto [&_button]:w-full [&_button]:justify-start [&_button]:bg-transparent [&_button]:p-0 [&_button]:text-inherit [&_button]:shadow-none",
                    ])}
                    onClick={() => close()}
                  >
                    {item}
                  </div>
                );
              }}
            </MenuItem>
          </div>
        ))}
      </MenuItems>
    </Menu>
  );
}
