"use client";

import { cn } from "@/utils/helpers";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";

const PopoverTrigger = ({ children }: { children: React.ReactNode }) => (
  <PopoverButton className="focus:outline-none">{children}</PopoverButton>
);

const PopoverContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <PopoverPanel
    className={cn(
      "absolute z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
  >
    {children}
  </PopoverPanel>
);

export { Popover, PopoverTrigger, PopoverContent };
