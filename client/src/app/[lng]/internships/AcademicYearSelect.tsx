"use client";

import Button from "@/components/Button";
import { cn } from "@/utils/helpers";
import {
  CloseButton,
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function AcademicYearSelect({
  selectedYear,
  years,
}: {
  selectedYear: string;
  years: string[];
}) {
  return (
    <Popover>
      <PopoverButton
        size="sm"
        as={Button}
        className="flex gap-2 group relative"
      >
        {selectedYear}
        <ChevronDownIcon className="size-3 group-data-[open]:rotate-180" />
      </PopoverButton>
      <PopoverPanel
        transition
        className={cn([
          "origin-top transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0",
          "[--anchor-gap:4px] sm:[--anchor-gap:8px] empty:hidden z-10 absolute max-h-44 overflow-y-auto flex flex-col mt-2 w-[var(--button-width)] text-sm p-2 rounded-lg bg-white text-gray-900 shadow-lg ring-1 ring-black/5",
          "dark:text-white/85 dark:bg-gray-800 dark:ring-gray-700",
        ])}
      >
        {years.map((year) => (
          <CloseButton
            className="hover:bg-primary-500 hover:text-white dark:hover:bg-primary-300 dark:hover:text-white/85 -mx-2 px-2 py-1 text-center"
            as={Link}
            key={year}
            href={`?academicYear=${year}`}
          >
            {year}
          </CloseButton>
        ))}
      </PopoverPanel>
    </Popover>
  );
}
