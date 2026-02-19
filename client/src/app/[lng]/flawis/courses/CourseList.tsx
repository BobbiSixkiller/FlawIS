"use client";

import Link from "next/link";
import { LegacyRef, ReactNode } from "react";
import {
  Connection,
  withInfiniteScroll,
} from "@/components/withInfiniteScroll";
import { usePathname } from "next/navigation";
import {
  CourseFragment,
  CoursesQueryVariables,
} from "@/lib/graphql/generated/graphql";
import { getCourses } from "./actions";
import Card from "@/components/Card";
import DynamicImageClient from "@/components/DynamicImageClient";

function ListItem({ data }: { data?: CourseFragment }) {
  const path = usePathname();

  return (
    <Card
      as={Link}
      href={path.includes("courses") ? `/courses/${data?.id}` : `/${data?.id}`}
    >
      <DynamicImageClient
        fill
        src={data?.thumbnail ?? "/images/img-placeholder.jpg"}
        alt={data?.name ?? "thumbnail"}
        className="relative w-full h-40 rounded-lg overflow-hidden mb-3 object-cover"
      />

      <h2 className="font-medium leading-6">{data?.name}</h2>

      <div className="flex flex-wrap gap-1 mt-1">
        {data?.categories.map((cat) => (
          <span
            key={String(cat.id)}
            className="text-xs bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 rounded-full px-2 py-0.5"
          >
            {cat.name}
          </span>
        ))}
      </div>

      <div className="mt-2 space-y-0.5 text-sm text-gray-500 dark:text-gray-400">
        <p>
          Začiatok:{" "}
          {data?.start ? new Date(data.start).toLocaleDateString("sk") : "—"}
        </p>
        <p>
          Koniec:{" "}
          {data?.end ? new Date(data.end).toLocaleDateString("sk") : "—"}
        </p>
        <p>
          Registrácia do:{" "}
          {data?.registrationEnd
            ? new Date(data.registrationEnd).toLocaleDateString("sk")
            : "—"}
        </p>
      </div>
    </Card>
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

export default function CourseList({
  initialData,
  vars,
}: {
  initialData: Connection<CourseFragment>;
  vars: CoursesQueryVariables;
}) {
  const InfiniteScrollCourseList = withInfiniteScroll<
    CourseFragment,
    CoursesQueryVariables
  >({
    vars,
    getData: getCourses,
    initialData,
    ListItem,
    Container,
    Placeholder,
  });

  return <InfiniteScrollCourseList />;
}
