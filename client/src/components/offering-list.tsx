"use client";

import Link from "next/link";
import { LegacyRef, ReactNode } from "react";

import { getConferences } from "@/app/[lng]/flawis/conferences/actions";
import { getCourses } from "@/app/[lng]/flawis/courses/actions";
import { Card, CardContent } from "@/components/ui/card";
import DynamicImageClient from "@/components/dynamic-image-client";
import { Connection, InfiniteScroll } from "@/components/with-infinite-scroll";
import {
  ConferenceListItemFragment,
  ConferencesQueryVariables,
  CourseListItemFragment,
  CoursesQueryVariables,
} from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utilsClient";
import {
  conferenceOfferingModel,
  courseOfferingModel,
  OfferingCardModel,
} from "@/components/offering-model";

type OfferingListProps =
  | {
      kind: "course";
      initialData: Connection<CourseListItemFragment>;
      vars: CoursesQueryVariables;
      hrefBase: string;
      lng: string;
    }
  | {
      kind: "conference";
      initialData: Connection<ConferenceListItemFragment>;
      vars: ConferencesQueryVariables;
      hrefBase: string;
      lng: string;
    };

const formatters = new Map<string, Intl.DateTimeFormat>();

function dateFormatter(lng: string) {
  const locale = lng === "en" ? "en-GB" : "sk-SK";
  let formatter = formatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeZone: "Europe/Bratislava",
    });
    formatters.set(locale, formatter);
  }
  return formatter;
}

function OfferingCard({ item, lng }: { item: OfferingCardModel; lng: string }) {
  const { t } = useTranslation(lng, "common");
  const formatter = dateFormatter(lng);

  return (
    <Link
      href={item.href}
      className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="py-5 transition-shadow group-hover:ring-primary/40">
        <CardContent className="px-5">
          <DynamicImageClient
            fill
            sizes="(max-width: 640px) calc(100vw - 4rem), 28rem"
            src={item.imageSrc}
            alt={item.title}
            className={cn(
              "relative mb-4 h-40 w-full overflow-hidden rounded-xl bg-muted dark:bg-card",
              item.imageFit === "cover" ? "object-cover" : "object-contain p-3",
            )}
          />

          <h2 className="text-base font-medium leading-6 transition-colors group-hover:text-primary dark:group-hover:text-primary">
            {item.title}
          </h2>

          {item.badges.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.badges.map((badge, index) => (
                <span
                  key={`${badge}-${index}`}
                  className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground dark:bg-accent dark:text-accent-foreground"
                >
                  {badge}
                </span>
              ))}
            </div>
          ) : null}

          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm text-muted-foreground dark:text-muted-foreground">
            <dt>{t("offering.start")}</dt>
            <dd className="text-right text-foreground">
              <time dateTime={item.start.toISOString()}>
                {formatter.format(item.start)}
              </time>
            </dd>
            <dt>{t("offering.end")}</dt>
            <dd className="text-right text-foreground">
              <time dateTime={item.end.toISOString()}>
                {formatter.format(item.end)}
              </time>
            </dd>
            {item.registrationEnd ? (
              <>
                <dt>{t("offering.registrationEnd")}</dt>
                <dd className="text-right text-foreground">
                  <time dateTime={item.registrationEnd.toISOString()}>
                    {formatter.format(item.registrationEnd)}
                  </time>
                </dd>
              </>
            ) : null}
          </dl>
        </CardContent>
      </Card>
    </Link>
  );
}

function Container({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}

function Placeholder({ cardRef }: { cardRef?: LegacyRef<HTMLDivElement> }) {
  return (
    <div ref={cardRef} className="rounded-2xl border p-4 shadow-sm">
      <div className="animate-pulse space-y-4">
        <div className="h-40 rounded-xl bg-muted dark:bg-muted" />
        <div className="h-3 w-2/3 rounded-sm bg-muted dark:bg-muted" />
        <div className="h-2 rounded-sm bg-muted dark:bg-muted" />
        <div className="h-2 w-4/5 rounded-sm bg-muted dark:bg-muted" />
      </div>
    </div>
  );
}

function Empty({ lng }: { lng: string }) {
  const { t } = useTranslation(lng, "common");
  return (
    <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground dark:border-border dark:text-muted-foreground">
      {t("offering.empty")}
    </div>
  );
}

async function conferencePage(vars: ConferencesQueryVariables) {
  const data = await getConferences(vars);
  if (!data) throw new Error("Conference catalogue could not be loaded.");
  return data;
}

export default function OfferingList(props: OfferingListProps) {
  if (props.kind === "course") {
    return (
      <InfiniteScroll<CourseListItemFragment, CoursesQueryVariables>
        vars={props.vars}
        getData={getCourses}
        initialData={props.initialData}
        Container={Container}
        Placeholder={Placeholder}
        Empty={<Empty lng={props.lng} />}
        renderItem={(course) =>
          course ? (
            <OfferingCard
              item={courseOfferingModel(course, props.hrefBase)}
              lng={props.lng}
            />
          ) : null
        }
      />
    );
  }

  return (
    <InfiniteScroll<ConferenceListItemFragment, ConferencesQueryVariables>
      vars={props.vars}
      getData={conferencePage}
      initialData={props.initialData}
      Container={Container}
      Placeholder={Placeholder}
      Empty={<Empty lng={props.lng} />}
      renderItem={(conference) =>
        conference ? (
          <OfferingCard
            item={conferenceOfferingModel(
              conference,
              props.hrefBase,
              props.lng,
            )}
            lng={props.lng}
          />
        ) : null
      }
    />
  );
}
