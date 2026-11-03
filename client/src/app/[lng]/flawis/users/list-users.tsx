"use client";

import Link from "next/link";
import { getUsers } from "./actions";
import { Connection, InfiniteScroll } from "@/components/with-infinite-scroll";
import { LegacyRef, ReactNode } from "react";
import {
  Access,
  UserFilterInput,
  UsersQueryVariables,
} from "@/lib/graphql/generated/graphql";
import { cn } from "@/lib/utilsClient";

interface UserData {
  id: string;
  name: string;
  organization?: string | null;
  email: string;
  access: Access[];
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

function ListItem({ data }: { data?: UserData }) {
  return (
    <Link
      className={cn([
        "rounded-2xl border p-4 shadow-sm hover:shadow-lg text-foreground text-sm cursor-pointer focus:ring-ring",
        "dark:border-border dark:bg-muted dark:text-foreground",
      ])}
      href={`/users/${data?.id}`}
    >
      <h2 className="font-medium leading-6">{data?.name}</h2>
      <p className="leading-none text-muted-foreground dark:text-muted-foreground">
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
    <div ref={cardRef} className="rounded-2xl border p-4 shadow-sm">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-muted h-10 w-10"></div>
        <div className="flex-1 space-y-6 py-1">
          <div className="h-2 bg-muted rounded-sm"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-2 bg-muted rounded-sm col-span-2"></div>
              <div className="h-2 bg-muted rounded-sm col-span-1"></div>
            </div>
            <div className="h-2 bg-muted rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListUsers({
  initialData,
  vars,
}: {
  initialData: Connection<UserData>;
  vars: UsersQueryVariables;
}) {
  return (
    <InfiniteScroll<UserData, UsersQueryVariables>
      vars={vars}
      getData={getUsers}
      initialData={initialData}
      ListItem={ListItem}
      Container={Container}
      Placeholder={Placeholder}
    />
  );
}
