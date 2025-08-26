"use client";

import Link from "next/link";
import { LegacyRef, ReactNode } from "react";
import {
  Connection,
  withInfiniteScroll,
} from "@/components/withInfiniteScroll";
import { getInternships } from "./actions";
import { useParams, usePathname } from "next/navigation";
import {
  ApplicationFragment,
  InternshipsQueryVariables,
  Status,
} from "@/lib/graphql/generated/graphql";
import { cn } from "@/utils/helpers";
import { useTranslation } from "@/lib/i18n/client";

interface InternshipData {
  id: string;
  organization: string;
  academicYear: string;
  applicationsCount: number;
  description: string;
  myApplication?: ApplicationFragment | null;
}

const statusClasses = {
  [Status.Applied]: {
    card: "border-primary-500 shadow shadow-primary-500 hover:shadow-lg hover:shadow-primary-500",
    label: "text-primary-500",
  },
  [Status.Eligible]: {
    card: "border-primary-500 shadow shadow-primary-500 hover:shadow-lg hover:shadow-primary-500",
    label: "text-primary-500",
  },
  [Status.Accepted]: {
    card: "border-green-500 shadow shadow-green-500 hover:shadow-lg hover:shadow-green-500",
    label: "text-green-500",
  },
  [Status.Rejected]: {
    card: "border-red-500 shadow shadow-red-500 hover:shadow-lg hover:shadow-red-500",
    label: "text-red-500",
  },
};

function ListItem({ data }: { data?: InternshipData }) {
  const path = usePathname();
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "internships");

  return (
    <Link
      className={cn([
        "relative rounded-2xl border dark:border-gray-700 shadow hover:shadow-lg p-4 text-gray-900 dark:text-white text-sm cursor-pointer outline-none focus:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-2 bg-white dark:bg-gray-700",
        data?.myApplication && statusClasses[data?.myApplication?.status].card,
      ])}
      href={
        path.includes("internships")
          ? `/internships/${data?.id}`
          : `/${data?.id}`
      }
    >
      <div className="flex flex-wrap justify-between">
        <h2 className="font-medium leading-6">{data?.organization}</h2>
        {data?.myApplication && (
          <p className={cn([statusClasses[data.myApplication.status].label])}>
            {t(data.myApplication.status)}
          </p>
        )}
      </div>

      <p className="leading-none text-gray-500 dark:text-gray-300">
        {data?.academicYear}
      </p>
      <p className="line-clamp-3">
        {data?.description.replace(/<[^>]*>/g, " ").trim()}
      </p>
      <p className="mt-2">Pocet zaujemcov: {data?.applicationsCount}</p>
    </Link>
  );
}

function Container({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}

function Placeholder({ cardRef }: { cardRef?: LegacyRef<HTMLDivElement> }) {
  return (
    <div ref={cardRef} className="rounded-2xl border p-4 shadow">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-slate-200 h-10 w-10"></div>
        <div className="flex-1 space-y-6 py-1">
          <div className="h-2 bg-slate-200 rounded"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-2 bg-slate-200 rounded col-span-2"></div>
              <div className="h-2 bg-slate-200 rounded col-span-1"></div>
            </div>
            <div className="h-2 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListInternships({
  initialData,
  vars,
}: {
  initialData: Connection<InternshipData>;
  vars: InternshipsQueryVariables;
}) {
  const InfiniteScrollListInternships = withInfiniteScroll<
    InternshipData,
    InternshipsQueryVariables
  >({
    vars,
    getData: getInternships,
    initialData,
    ListItem,
    Container,
    Placeholder,
  });

  return <InfiniteScrollListInternships />;
}
