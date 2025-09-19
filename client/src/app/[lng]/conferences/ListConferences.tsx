"use client";

import Link from "next/link";
import {
  Connection,
  withInfiniteScroll,
} from "@/components/withInfiniteScroll";
import { LegacyRef, ReactNode } from "react";
import { useParams, usePathname } from "next/navigation";
import {
  ConferenceFragment,
  ConferencesQueryVariables,
} from "@/lib/graphql/generated/graphql";
import DynamicImageClient from "@/components/DynamicImageClient";
import { getConferences } from "../flawis/conferences/actions";
import { cn } from "@/utils/helpers";
import { useTranslation } from "@/lib/i18n/client";

function ListItem({ data }: { data?: ConferenceFragment }) {
  const { lng } = useParams<{ lng: string }>();
  const path = usePathname();

  const { t } = useTranslation(lng, "conferences");

  // Create Date objects for start and end dates
  const startDate = data?.dates.start ? new Date(data.dates.start) : null;
  const endDate = data?.dates.end ? new Date(data.dates.end) : null;
  const regEndDate = data?.dates.regEnd ? new Date(data.dates.regEnd) : null;

  // Format start and end dates using toLocaleString method
  const start = startDate
    ? startDate.toLocaleString("sk", { timeZone: "UTC" })
    : "N'/'A";
  const end = endDate
    ? endDate.toLocaleString("sk", { timeZone: "UTC" })
    : "N'/'A";
  const regEnd = regEndDate
    ? regEndDate.toLocaleString("sk", { timeZone: "UTC" })
    : "N/A";

  return (
    <Link
      className={cn([
        "flex flex-col gap-1 justify-between rounded-2xl border p-4 shadow hover:shadow-lg text-gray-900 bg-white text-sm cursor-pointer focus:outline-primary-500",
        "dark:border-gray-700 dark:bg-gray-700 dark:text-white",
      ])}
      href={
        path.includes("conferences")
          ? `/conferences/${data?.slug}`
          : `/${data?.slug}`
      }
    >
      <div>
        <DynamicImageClient
          alt="conference-logo"
          src={data!.translations[lng as "sk" | "en"].logoUrl}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: "contain" }}
          className="h-24 w-full max-w-72"
        />
        <h2 className="font-medium leading-6">
          {data?.translations[lng as "sk" | "en"].name}
        </h2>
      </div>

      <p className="leading-none text-gray-500 dark:text-gray-300">
        {t("conference.listItem", {
          start,
          end,
          regEnd,
          interpolation: { escapeValue: false },
        })}
      </p>
    </Link>
  );
}

function Container({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {children}
    </div>
  );
}

function Placeholder({ cardRef }: { cardRef?: LegacyRef<HTMLDivElement> }) {
  return (
    <div ref={cardRef} className="rounded-2xl border p-4 shadow">
      <div className="animate-pulse flex flex-col space-y-4">
        <div className="rounded bg-slate-200 h-28"></div>
        <div className="space-y-3">
          <div className="h-2 bg-slate-200 rounded w-1/2"></div>
          <div className="h-2 bg-slate-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default function ListConferences({
  initialData,
  vars,
}: {
  initialData: Connection<ConferenceFragment & {}>;
  vars: ConferencesQueryVariables;
}) {
  const InfiniteScrollListUsers = withInfiniteScroll<
    ConferenceFragment,
    ConferencesQueryVariables
  >({
    vars,
    getData: getConferences,
    initialData,
    Container,
    ListItem,
    Placeholder,
  });

  return <InfiniteScrollListUsers />;
}
