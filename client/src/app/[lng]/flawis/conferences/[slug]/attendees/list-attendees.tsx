"use client";

import Link from "next/link";
import { getAttendees } from "./actions";
import { Connection, InfiniteScroll } from "@/components/with-infinite-scroll";
import { LegacyRef, ReactNode } from "react";
import {
  AttendeeFragment,
  AttendeesQueryVariables,
} from "@/lib/graphql/generated/graphql";
import { cn } from "@/lib/utilsClient";

function ListItem({ data }: { data?: AttendeeFragment }) {
  return (
    <Link
      className={cn([
        "rounded-2xl border p-4 shadow-sm hover:shadow-lg text-foreground text-sm cursor-pointer focus:ring-ring",
        "dark:border-border dark:bg-muted dark:text-foreground",
      ])}
      href={`/conferences/${data?.conference.slug}/attendees/${data?.id}`}
    >
      <h2 className="font-medium leading-6">{data?.user.name}</h2>
      <p className="leading-none text-muted-foreground">
        {data?.user.__typename === "User" ? data.user.organization : "N/A"}
      </p>
      <p className="mt-2">Email: {data?.user.email}</p>
      {data?.ticket.withSubmission &&
        data?.submissions.some((submission) => !submission.fileUrl) && (
          <p className="text-orange-500">Neodovzdal prispevok</p>
        )}
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

export default function ListAttendees({
  initialData,
  vars,
}: {
  initialData: Connection<AttendeeFragment>;
  vars: AttendeesQueryVariables;
}) {
  return (
    <InfiniteScroll<AttendeeFragment, AttendeesQueryVariables>
      vars={vars}
      getData={getAttendees}
      initialData={initialData}
      ListItem={ListItem}
      Container={Container}
      Placeholder={Placeholder}
    />
  );
}
