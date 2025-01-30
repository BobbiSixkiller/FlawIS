"use client";

import { LegacyRef, ReactNode } from "react";
import {
  Connection,
  GetDataFilter,
  withInfiniteScroll,
} from "@/components/withInfiniteScroll";
import { getInterns } from "./actions";
import { ApplicationFragment } from "@/lib/graphql/generated/graphql";
import DynamicImageClient from "@/components/DynamicImageClient";
import { displayDate } from "@/utils/helpers";
import { useTranslation } from "@/lib/i18n/client";
import { useParams, usePathname } from "next/navigation";
import Button from "@/components/Button";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

function ListItem({ data }: { data?: ApplicationFragment }) {
  const { lng, internshipId } = useParams<{
    lng: string;
    internshipId: string;
  }>();
  const { t } = useTranslation(lng, ["internships", "common"]);
  const path = usePathname();

  return (
    <li className="flex sm:justify-between items-center gap-6 py-5">
      <div className="flex flex-1 flex-col sm:flex-row sm:justify-between gap-6">
        <div className="flex gap-x-4">
          {data?.user.avatarUrl ? (
            <DynamicImageClient
              src={data.user.avatarUrl}
              alt="Avatar"
              className="size-12 rounded-full"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className="size-12 rounded-full text-2xl flex justify-center items-center bg-primary-300 text-white">
              {data?.user.name
                .split(" ")
                .map((n, i) => {
                  if (i < 2) return n[0].toUpperCase();
                })
                .join("")}
            </div>
          )}
          <div>
            <p className="text-sm/6 font-semibold text-gray-900">
              {data?.user.name}
            </p>
            <p className="mt-1 truncate text-xs/5 text-gray-500">
              {data?.user.email}
            </p>
          </div>
        </div>

        <div className="sm:flex sm:flex-col sm:items-end sm:text-right">
          <p className="text-sm/6 text-gray-900">{data?.status}</p>
          <p className="mt-1 text-xs/5 text-gray-500">
            {t("updatedAt", {
              ns: "common",
              value: displayDate(data?.updatedAt, lng),
            })}
          </p>
        </div>
      </div>

      <Button
        variant="ghost"
        as={Link}
        href={
          path.includes("internships")
            ? `/internships/${internshipId}/applications/${data?.id}`
            : `/${internshipId}/applications/${data?.id}`
        }
        className="rounded-full h-full p-2 hover:bg-gray-100 hover:text-gray-400"
      >
        <ChevronRightIcon className="size-5" />
      </Button>
    </li>
  );
}

function Container({ children }: { children: ReactNode }) {
  return (
    <ul role="list" className="divide-y">
      {children}
    </ul>
  );
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

export default function ListInterns({
  initialData,
  filter,
}: {
  initialData: Connection<ApplicationFragment>;
  filter: GetDataFilter;
}) {
  const InfiniteScrollListInternships = withInfiniteScroll<ApplicationFragment>(
    {
      filter,
      getData: getInterns,
      initialData,
      ListItem,
      Container,
      Placeholder,
    }
  );

  return <InfiniteScrollListInternships />;
}
