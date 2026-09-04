"use client";

import Link from "next/link";
import { LegacyRef, ReactNode } from "react";
import {
  Connection,
  InfiniteScroll,
} from "@/components/withInfiniteScroll";
import { getInternships } from "./actions";
import { useParams } from "next/navigation";
import {
  ApplicationFragment,
  InternshipsQueryVariables,
  Status,
} from "@/lib/graphql/generated/graphql";
import { cn } from "@/lib/clientUtils";
import { useTranslation } from "@/lib/i18n/client";
import { internshipListHref } from "@/lib/internshipAccess";

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
    card: "border-primary-500 shadow-sm shadow-primary-500 hover:shadow-lg hover:shadow-primary-500",
    label: "text-primary-500",
  },
  [Status.Eligible]: {
    card: "border-primary-500 shadow-sm shadow-primary-500 hover:shadow-lg hover:shadow-primary-500",
    label: "text-primary-500",
  },
  [Status.Accepted]: {
    card: "border-green-500 shadow-sm shadow-green-500 hover:shadow-lg hover:shadow-green-500",
    label: "text-green-500",
  },
  [Status.Rejected]: {
    card: "border-red-500 shadow-sm shadow-red-500 hover:shadow-lg hover:shadow-red-500",
    label: "text-red-500",
  },
};

function ListItem({ data, hrefBase }: { data?: InternshipData; hrefBase: string }) {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "internships");

  return (
    <Link
      className={cn([
        "relative rounded-2xl border dark:border-gray-700 shadow-sm hover:shadow-lg p-4 text-gray-900 dark:text-white text-sm cursor-pointer outline-hidden focus:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-2 bg-white dark:bg-gray-700",
        data?.myApplication && statusClasses[data?.myApplication?.status].card,
      ])}
      href={internshipListHref(hrefBase, data?.id ?? "")}
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
      <p className="mt-2">
        {t("applicationsCount", { count: data?.applicationsCount ?? 0 })}
      </p>
    </Link>
  );
}

function Container({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}

function Placeholder({ cardRef }: { cardRef?: LegacyRef<HTMLDivElement> }) {
  return (
    <div ref={cardRef} className="rounded-2xl border p-4 shadow-sm">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-slate-200 h-10 w-10"></div>
        <div className="flex-1 space-y-6 py-1">
          <div className="h-2 bg-slate-200 rounded-sm"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-2 bg-slate-200 rounded-sm col-span-2"></div>
              <div className="h-2 bg-slate-200 rounded-sm col-span-1"></div>
            </div>
            <div className="h-2 bg-slate-200 rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListInternships({
  initialData,
  vars,
  hrefBase,
}: {
  initialData: Connection<InternshipData>;
  vars: InternshipsQueryVariables;
  hrefBase: string;
}) {
  return (
    <InfiniteScroll<InternshipData, InternshipsQueryVariables>
      vars={vars}
      getData={getInternships}
      initialData={initialData}
      renderItem={(data) => <ListItem data={data} hrefBase={hrefBase} />}
      Container={Container}
      Placeholder={Placeholder}
    />
  );
}
