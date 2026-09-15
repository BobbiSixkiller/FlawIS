"use client";

import { cn } from "@/lib/utilsClient";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuItemsProps,
} from "@headlessui/react";
import { Children, ReactElement, ReactNode } from "react";
import Button, { ButtonProps } from "./Button";

export type DropdownItem = ReactElement;

interface DropdownProps {
  trigger: ReactNode;
  triggerProps?: ButtonProps;
  items: DropdownItem[];
  anchor?: MenuItemsProps["anchor"];
  buttonWidth?: boolean;
}

function DropdownMenuItem({ item }: { item: DropdownItem }) {
  // Resolve streamed server children only when the menu mounts its items.
  const children = Children.toArray(item);
  return <MenuItem>{children.length === 1 ? children[0] : children}</MenuItem>;
}

export default function Dropdown({
  trigger,
  triggerProps,
  items,
  anchor = { to: "bottom", gap: 4 },
  buttonWidth,
}: DropdownProps) {
  return (
    <Menu>
      <MenuButton
        as={Button}
        {...triggerProps}
        className={cn(triggerProps?.className, "cursor-pointer")}
      >
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
          <div
            className={cn([
              "p-1",
              "[&>*]:flex [&>*]:min-h-11 [&>*]:h-auto [&>*]:w-full [&>*]:items-center [&>*]:justify-start [&>*]:gap-2 [&>*]:rounded-md [&>*]:p-2 [&>*]:text-sm",
              "[&>*]:bg-transparent [&>*]:text-inherit [&>*]:shadow-none",
              "[&>[data-focus]]:bg-primary-500 [&>[data-focus]]:text-white dark:[&>[data-focus]]:bg-primary-300/90 dark:[&>[data-focus]]:text-gray-900",
            ])}
            key={item.key ?? i}
          >
            {/* Keep touch and keyboard activation on the actual link or button. */}
            <DropdownMenuItem item={item} />
          </div>
        ))}
      </MenuItems>
    </Menu>
  );
}
