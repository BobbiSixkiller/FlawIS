"use client";

import { ReactNode } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useTranslation } from "@/lib/i18n/client";
import Link from "next/link";
import Dropdown from "./Dropdown";
import Button from "./Button";

export default function Heading({
  heading,
  subHeading,
  links,
  lng,
}: {
  heading: string;
  subHeading?: ReactNode;
  links?: { text: string; href: string; icon?: ReactNode }[];
  lng: string;
}) {
  const first = links?.[0];
  const restLinks = links?.slice(1);

  const { t } = useTranslation(lng, "common");

  return (
    <div className="lg:flex lg:items-center lg:justify-between">
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight dark:text-white/85">
          {heading}
        </h2>
        {subHeading && (
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6 text-gray-400 dark:text-white/65 text-sm">
            {subHeading}
          </div>
        )}
      </div>
      <div className="mt-5 flex items-center gap-3 lg:ml-4 lg:mt-0">
        {restLinks?.map((l, i) => (
          <span className="hidden sm:block" key={i}>
            <Button
              as={Link}
              scroll={false}
              href={l.href}
              className="inline-flex gap-2 items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              {l.icon} {l.text}
            </Button>
          </span>
        ))}

        {first && (
          <Button
            as={Link}
            scroll={false}
            href={first.href}
            className="inline-flex items-center gap-2 rounded-md bg-primary-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            {first.icon} {first.text}
          </Button>
        )}

        {/* Dropdown */}
        {restLinks && restLinks.length > 0 && (
          <div className="sm:hidden">
            <Dropdown
              trigger={
                <Button className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-400 hover:bg-white/90">
                  {t("more")}
                  <ChevronDownIcon
                    className="-mr-1 ml-1.5 h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </Button>
              }
              items={restLinks}
            />
          </div>
        )}
      </div>
    </div>
  );
}
