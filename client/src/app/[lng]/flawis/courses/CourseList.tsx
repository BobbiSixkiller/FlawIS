"use client";

import Link from "next/link";
import { LegacyRef, ReactNode } from "react";
import {
  Connection,
  withInfiniteScroll,
} from "@/components/withInfiniteScroll";
import { useParams, usePathname } from "next/navigation";
import {
  CourseFragment,
  CoursesQueryVariables,
} from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { getCourses } from "./actions";
import Card from "@/components/Card";
import { Input } from "@/components/Input";

function ListItem({ data }: { data?: CourseFragment }) {
  const path = usePathname();
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "internships");

  return (
    <Card
      as={Link}
      href={path.includes("courses") ? `/courses/${data?.id}` : `/${data?.id}`}
    >
      <div className="flex flex-wrap justify-between">
        <h2 className="font-medium leading-6">{data?.name}</h2>
      </div>

      <p className="leading-none text-gray-500 dark:text-gray-300">
        {data?.isPaid ? data?.price : "Zadarmo"}
      </p>
      <p className="line-clamp-3">
        {data?.description.replace(/<[^>]*>/g, " ").trim()}
      </p>
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
