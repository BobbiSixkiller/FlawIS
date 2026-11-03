"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utilsClient";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import Icon from "@/components/icon";
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
    <Popover>
      <PopoverTrigger
        render={<Button variant="ghost" size="sm" />}
        className="group h-11 cursor-pointer rounded-full border border-border bg-card px-4 text-foreground dark:border-border dark:bg-card dark:text-foreground"
      >
        {selectedYear}
        <Icon
          name="chevron-down"
          className="size-3 transition-transform group-data-open:rotate-180 motion-reduce:transition-none"
        />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="z-30 max-h-[min(24rem,60vh)] w-(--anchor-width) origin-top-right overflow-y-auto rounded-2xl border border-border bg-card p-3 text-sm text-foreground shadow-lg transition duration-150 ease-out data-closed:scale-95 data-closed:opacity-0 motion-reduce:transition-none dark:border-border dark:bg-card dark:text-foreground"
      >
        {years.map((year) => (
          <PopoverPrimitive.Close
            nativeButton={false}
            key={year}
            aria-current={year === selectedYear ? "true" : undefined}
            className={cn(
              "flex min-h-11 w-full items-center justify-start whitespace-normal rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-ring dark:hover:bg-card/20",
              year === selectedYear &&
                "bg-accent text-accent-foreground dark:bg-accent dark:text-accent-foreground",
            )}
            render={
              <Link
                href={`${pathname}?${replaceQueryParameter(
                  searchParams,
                  "academicYear",
                  year,
                )}`}
              />
            }
          >
            {year}
          </PopoverPrimitive.Close>
        ))}
      </PopoverContent>
    </Popover>
  );
}
