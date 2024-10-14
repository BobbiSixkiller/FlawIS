"use client";

import Link from "next/link";
import {
  Connection,
  withInfiniteScroll,
} from "@/components/withInfiniteScroll";
import { getConferences } from "./actions";
import Image from "next/image";
import { LegacyRef, ReactNode, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ConferenceFragment } from "@/lib/graphql/generated/graphql";
import { getImage } from "@/components/DynamicImage";

function ListItem({ data }: { data?: ConferenceFragment }) {
  const { lng } = useParams<{ lng: string }>();
  const [blurUrl, setBlurUrl] = useState("");

  useEffect(() => {
    async function getBlurUrl() {
      await getImage(data!.translations[lng as "sk" | "en"].logoUrl);
    }
  }, []);

  // Create Date objects for start and end dates
  const startDate = data?.dates.start ? new Date(data.dates.start) : null;
  const endDate = data?.dates.end ? new Date(data.dates.end) : null;

  // Format start and end dates using toLocaleString method
  const start = startDate
    ? startDate.toLocaleString("sk", { timeZone: "UTC" })
    : "N/A";
  const end = endDate
    ? endDate.toLocaleString("sk", { timeZone: "UTC" })
    : "N/A";

  return (
    <Link
      className="h-fit w-fit rounded-2xl border p-4 shadow hover:shadow-lg text-gray-900 text-sm cursor-pointer focus:outline-primary-500"
      href={`/conferences/${data?.slug}`}
    >
      <div className="relative h-24 w-full max-w-72">
        <Image
          alt="conference-logo"
          src={data!.translations[lng as "sk" | "en"].logoUrl}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
        />
      </div>

      <h2 className="font-medium leading-6">
        {data?.translations[lng as "sk" | "en"].name}
      </h2>
      <p className="leading-none text-gray-500">
        Prebieha od {start} do {end}
      </p>
    </Link>
  );
}

function Container({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
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
}: {
  initialData: Connection<ConferenceFragment & {}>;
}) {
  const InfiniteScrollListUsers = withInfiniteScroll<ConferenceFragment>({
    filter: { after: undefined, first: undefined },
    getData: getConferences,
    initialData,
    Container,
    ListItem,
    Placeholder,
  });

  return <InfiniteScrollListUsers />;
}
