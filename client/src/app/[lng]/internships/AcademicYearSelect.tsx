"use client";

import Button from "@/components/Button";
import { cn } from "@/lib/utilsClient";
import {
  CloseButton,
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";
import Icon from "@/components/Icon";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { replaceQueryParameter } from "@/lib/internshipAccess";

export default function AcademicYearSelect({
  selectedYear,
  years,
}: {
  selectedYear: string;
  years: string[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <Popover className="inline-flex shrink-0">
      <PopoverButton
        as={Button}
        variant="ghost"
        size="sm"
        className="group h-11 cursor-pointer rounded-full border border-gray-200 bg-white px-4 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-white/85"
      >
        {selectedYear}
        <Icon
          name="chevron-down"
          className="size-3 transition-transform group-data-open:rotate-180 motion-reduce:transition-none"
        />
      </PopoverButton>
      <PopoverPanel
        focus
        transition
        anchor={{ to: "bottom end", gap: 8, padding: 24 }}
        className="z-30 max-h-[min(24rem,60vh)] w-(--button-width) origin-top-right overflow-y-auto rounded-2xl border border-gray-200 bg-white p-3 text-sm text-gray-900 shadow-lg transition duration-150 ease-out data-closed:scale-95 data-closed:opacity-0 motion-reduce:transition-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/85"
      >
        {years.map((year) => (
          <CloseButton
            as={Link}
            key={year}
            aria-current={year === selectedYear ? "true" : undefined}
            className={cn(
              "flex min-h-11 w-full items-center justify-start whitespace-normal rounded-xl px-2 py-2 text-left transition-colors hover:bg-black/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:hover:bg-white/20",
              year === selectedYear &&
                "bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-200",
            )}
            href={`${pathname}?${replaceQueryParameter(
              searchParams,
              "academicYear",
              year,
            )}`}
          >
            {year}
          </CloseButton>
        ))}
      </PopoverPanel>
    </Popover>
  );
}
