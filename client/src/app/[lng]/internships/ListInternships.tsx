"use client";

import Link from "next/link";
import { LegacyRef, ReactNode } from "react";
import {
  Connection,
  GetDataFilter,
  withInfiniteScroll,
} from "@/components/withInfiniteScroll";
import { getInternships } from "./actions";

interface InternshipData {
  id: string;
  organization: string;
  academicYear: string;
  applicationsCount: number;
  description: string;
}

function ListItem({ data }: { data?: InternshipData }) {
  return (
    <Link
      className="rounded-2xl border p-4 shadow hover:shadow-lg text-gray-900 text-sm cursor-pointer focus:outline-primary-500"
      href={`/${data?.id}`}
    >
      <h2 className="font-medium leading-6">{data?.organization}</h2>
      <p className="leading-none text-gray-500">{data?.academicYear}</p>
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
  filter,
}: {
  initialData: Connection<InternshipData>;
  filter: GetDataFilter;
}) {
  const InfiniteScrollListInternships = withInfiniteScroll<InternshipData>({
    filter,
    getData: getInternships,
    initialData,
    ListItem,
    Container,
    Placeholder,
  });

  return <InfiniteScrollListInternships />;
}
