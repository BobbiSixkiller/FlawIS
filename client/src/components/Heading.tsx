"use client";

import { cloneElement, ReactNode } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useTranslation } from "@/lib/i18n/client";
import Link from "next/link";
import Dropdown, { DropdownItem } from "./Dropdown";
import Button from "./Button";

interface HeadingProps {
  heading: string;
  subHeading?: ReactNode;
  links?: DropdownItem[];
  lng: string;
}

export default function Heading({
  heading,
  subHeading,
  links = [],
  lng,
}: HeadingProps) {
  const { t } = useTranslation(lng, "common");

  const [primaryAction, ...secondaryActions] = links;

  return (
    <div className="lg:flex lg:justify-between">
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 w-full sm:text-3xl sm:tracking-tight dark:text-white/85">
          {heading}
        </h2>
        {subHeading && (
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6 text-gray-400 dark:text-white/65 text-sm">
            {subHeading}
          </div>
        )}
      </div>
      <div className="mt-5 flex gap-3 lg:ml-4 lg:mt-0">
        {/* Desktop buttons */}
        <div className="hidden sm:flex gap-3 ">
          {secondaryActions?.map((item, i) => {
            if (item.type === "link") {
              return (
                <Button
                  key={i}
                  as={Link}
                  scroll={false}
                  href={item.href}
                  className="hidden sm:flex"
                  variant="secondary"
                  size="sm"
                >
                  {item.icon} {item.text}
                </Button>
              );
            } else
              return cloneElement(item?.element, {
                ...item.element.props,
                key: i,
              });
          })}
        </div>

        {/* Primary button */}
        {primaryAction?.type === "link" ? (
          <Button as={Link} scroll={false} href={primaryAction.href} size="sm">
            {primaryAction.icon} {primaryAction.text}
          </Button>
        ) : (
          primaryAction?.element
        )}

        {/* Mobile dropdown */}
        {secondaryActions.length > 0 && (
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
              items={secondaryActions}
            />
          </div>
        )}
      </div>
    </div>
  );
}
