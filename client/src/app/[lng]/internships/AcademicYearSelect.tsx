"use client";

import Button from "@/components/Button";
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
        className="z-10 absolute max-h-44 overflow-y-auto flex flex-col mt-2 w-[var(--button-width)] text-sm p-2 rounded-lg shadow-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border dark:border-gray-700 origin-top transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        {years.map((year) => (
          <CloseButton
            className="hover:bg-primary-500 hover:text-white -mx-2 px-2 py-1 text-center"
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
