"use client";

import { LegacyRef, ReactNode } from "react";
import { Connection, InfiniteScroll } from "@/components/with-infinite-scroll";
import { getInterns } from "./actions";
import {
  ApplicationFragment,
  InternsQueryVariables,
} from "@/lib/graphql/generated/graphql";
import DynamicImageClient from "@/components/dynamic-image-client";
import { displayDate } from "@/lib/utilsClient";
import { useTranslation } from "@/lib/i18n/client";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Icon from "@/components/icon";
import Link from "next/link";

function ListItem({
  data,
  hrefBase,
}: {
  data?: ApplicationFragment;
  hrefBase: string;
}) {
  const { lng, internshipId } = useParams<{
    lng: string;
    internshipId: string;
  }>();
  const { t } = useTranslation(lng, ["internships", "common"]);

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
            <div className="size-12 rounded-full text-2xl flex justify-center items-center bg-primary text-primary-foreground">
              {data?.user.name
                .split(" ")
                .map((n, i) => {
                  if (i < 2) return n[0].toUpperCase();
                })
                .join("")}
            </div>
          )}
          <div>
            <p className="text-sm/6 font-semibold text-foreground dark:text-foreground">
              {data?.user.name}
            </p>
            <p className="mt-1 truncate text-xs/5 text-muted-foreground dark:text-muted-foreground">
              {data?.user.email}
            </p>
          </div>
        </div>

        <div className="sm:flex sm:flex-col sm:items-end sm:text-right">
          <p className="text-sm/6 text-foreground dark:text-foreground">
            {t(data!.status)}
          </p>
          <p className="mt-1 text-xs/5 text-muted-foreground dark:text-muted-foreground">
            {t("updatedAt", {
              ns: "common",
              value: displayDate(data?.updatedAt, lng),
            })}
          </p>
        </div>
      </div>

      <Button
        size="icon"
        variant="ghost"
        className="rounded-full"
        nativeButton={false}
        role="link"
        render={
          <Link href={`${hrefBase}/${internshipId}/applications/${data?.id}`} />
        }
      >
        <Icon name="chevron-right" className="size-5" />
      </Button>
    </li>
  );
}

function Container({ children }: { children: ReactNode }) {
  return (
    <ul role="list" className="divide-y dark:divide-border">
      {children}
    </ul>
  );
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

export default function ListInterns({
  initialData,
  vars,
  hrefBase,
}: {
  initialData: Connection<ApplicationFragment>;
  vars: InternsQueryVariables;
  hrefBase: string;
}) {
  return (
    <InfiniteScroll<ApplicationFragment, InternsQueryVariables>
      vars={vars}
      getData={getInterns}
      initialData={initialData}
      renderItem={(data) => (
        <ListItem data={data} hrefBase={hrefBase.replace(/\/$/, "")} />
      )}
      Container={Container}
      Placeholder={Placeholder}
    />
  );
}
