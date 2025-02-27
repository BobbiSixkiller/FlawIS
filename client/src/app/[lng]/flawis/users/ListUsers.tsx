"use client";

import Link from "next/link";
import { getUsers } from "./actions";
import {
  Connection,
  withInfiniteScroll,
} from "@/components/withInfiniteScroll";
import { LegacyRef, ReactNode } from "react";
import { Access } from "@/lib/graphql/generated/graphql";
import { cn } from "@/utils/helpers";

interface UserData {
  id: string;
  name: string;
  organization?: string | null;
  email: string;
  access: Access[];
  verified: boolean;
}

function ListItem({ data }: { data?: UserData }) {
  return (
    <Link
      className={cn([
        "rounded-2xl border p-4 shadow hover:shadow-lg text-gray-900 text-sm cursor-pointer focus:outline-primary-500",
        "dark:border-gray-700 dark:bg-gray-700 dark:text-white",
      ])}
      href={`/users/${data?.id}`}
    >
      <h2 className="font-medium leading-6">{data?.name}</h2>
      <p className="leading-none text-gray-500 dark:text-gray-300">
        {data?.organization}
      </p>
      <p className="mt-2">Email: {data?.email}</p>
      <p>Access: {data?.access.join(" ")}</p>
      <p className={`${data?.verified ? "text-green-500" : "text-red-500"}`}>
        {data?.verified ? "Ucet overeny" : "Ucet neovereny"}
      </p>
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

export default function ListUsers({
  initialData,
}: {
  initialData: Connection<UserData>;
}) {
  const InfiniteScrollListUsers = withInfiniteScroll<UserData>({
    filter: { after: undefined, first: undefined },
    getData: getUsers,
    initialData,
    ListItem,
    Container,
    Placeholder,
  });

  return <InfiniteScrollListUsers />;
}
