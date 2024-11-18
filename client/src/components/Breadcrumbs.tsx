"use client";

import React, { ReactNode } from "react";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/client";
import { languages } from "@/lib/i18n/settings";

type TBreadCrumbProps = {
  homeElement: ReactNode;
  separator: ReactNode;
  containerClasses?: string;
  listClasses?: string;
  activeClasses?: string;
  capitalizeLinks?: boolean;
};

export default function Breadcrumbs({
  homeElement,
  separator,
  containerClasses,
  listClasses,
  activeClasses,
  capitalizeLinks,
}: TBreadCrumbProps) {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "dashboard");

  const paths = usePathname();
  const pathNames = paths
    .split("/")
    .filter((path) => path)
    .filter((path) => !languages.includes(path)); //exclude locale in path
  const localized = pathNames.map((path) => t(path));

  return (
    <div>
      <ul className={containerClasses}>
        <Link
          href={"/"}
          className={
            pathNames.length > 0
              ? `${listClasses} ${activeClasses}`
              : listClasses
          }
        >
          {homeElement}
        </Link>
        {localized.map((link, index) => {
          let href = `/${pathNames.slice(0, index + 1).join("/")}`;
          let itemClasses =
            `/${pathNames.join("/")}` !== href
              ? `${listClasses} ${activeClasses}`
              : listClasses;
          let itemLink = capitalizeLinks
            ? link[0].toUpperCase() + link.slice(1, link.length)
            : link;
          return (
            <React.Fragment key={index}>
              {separator}
              <li className={itemClasses}>
                {index !== pathNames.length - 1 ? (
                  <Link href={href}>{itemLink}</Link>
                ) : (
                  itemLink
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );
}
