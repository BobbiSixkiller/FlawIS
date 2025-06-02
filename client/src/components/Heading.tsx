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
          <Button
            key={i}
            as={Link}
            scroll={false}
            href={l.href}
            className="hidden sm:flex gap-1"
            variant="secondary"
            size="sm"
          >
            {l.icon} {l.text}
          </Button>
        ))}

        {first && (
          <Button
            as={Link}
            scroll={false}
            href={first.href}
            className="flex gap-1"
            size="sm"
          >
            {first.icon} {first.text}
          </Button>
        )}

        {/* Dropdown */}
        {restLinks && restLinks.length > 0 && (
          <div className="sm:hidden">
            <Dropdown
              trigger={
                <Button variant="secondary" size="sm">
                  {t("more")}
                  <ChevronDownIcon
                    className="-mr-1 ml-1.5 size-5"
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
