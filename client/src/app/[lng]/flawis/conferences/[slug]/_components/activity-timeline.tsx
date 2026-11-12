"use client";
import { useState, useTransition } from "react";
import { getActivity } from "@/lib/reviews/actions";
import type { ConferenceActivityQuery } from "@/lib/graphql/generated/graphql";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { localizedText as tr } from "@/lib/i18n/text";
import { ErrorAlert } from "@/components/field-controls";
export default function ActivityTimeline({
  initial,
  conference,
  submission,
  lng,
}: {
  initial: ConferenceActivityQuery["conferenceActivity"];
  conference: string;
  submission?: string;
  lng: string;
}) {
  const t = tr(lng);
  const [events, setEvents] = useState(initial);
  const [more, setMore] = useState(initial.length === 100);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const formatter = new Intl.DateTimeFormat(lng === "en" ? "en-GB" : "sk-SK", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Europe/Bratislava",
  });
  return (
    <div className="flex flex-col gap-4">
      <ErrorAlert message={error} />
      {events.map((event) => (
        <article key={event.id} className="flex flex-col gap-2 border-b pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="outline">{activityLabel(event.action, lng)}</Badge>
            <time
              dateTime={event.createdAt}
              className="text-sm text-muted-foreground"
            >
              {formatter.format(new Date(event.createdAt))}
            </time>
          </div>
          <p className="text-sm">
            {event.actorName ||
              (event.actor.startsWith("review-link:")
                ? t(
                    "Recenzent cez osobný odkaz",
                    "Reviewer using a private link",
                  )
                : t("Používateľ", "User"))}
            {event.originalActor
              ? ` · ${t("v zastúpení", "impersonated session")}`
              : ""}
          </p>
          {typeof event.changes?.reason === "string" && (
            <p className="whitespace-pre-line text-sm">
              {event.changes.reason}
            </p>
          )}
          <details className="text-sm text-muted-foreground">
            <summary>
              {lng === "en" ? "Change details" : "Podrobnosti zmeny"}
            </summary>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all">
              {JSON.stringify(
                {
                  ...event.changes,
                  actor: event.actor,
                  originalActor: event.originalActor,
                  action: event.action,
                },
                null,
                2,
              )}
            </pre>
            <p className="mt-2">{event.requestId}</p>
          </details>
        </article>
      ))}
      {!events.length && (
        <p className="text-muted-foreground">
          {lng === "en"
            ? "No recorded actions yet."
            : "Zatiaľ nie sú zaznamenané žiadne akcie."}
        </p>
      )}
      {more && (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() =>
            start(async () => {
              setError("");
              try {
                const next = await getActivity(
                  conference,
                  submission,
                  events[events.length - 1]?.id,
                );
                setEvents((current) => [...current, ...next]);
                setMore(next.length === 100);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Request failed.");
              }
            })
          }
        >
          {lng === "en" ? "Older actions" : "Staršie akcie"}
        </Button>
      )}
    </div>
  );
}

function activityLabel(action: string, lng: string) {
  const labels: Record<string, [string, string]> = {
    "submission.viewed": ["Zobrazený príspevok", "Viewed submission"],
    "submission.listed": ["Zobrazený v zozname", "Listed submission"],
    "submission.file_uploaded": ["Nahraný súbor", "Uploaded file"],
    "submission.file_downloaded": ["Stiahnutý súbor", "Downloaded file"],
    "submission.withdrawn": ["Stiahnutý príspevok", "Withdrew submission"],
    "review.settings_updated": [
      "Zmenené nastavenia",
      "Updated review settings",
    ],
    "review.coordinator_granted": [
      "Pridaný koordinátor",
      "Appointed coordinator",
    ],
    "review.coordinator_revoked": [
      "Odobratý koordinátor",
      "Removed coordinator",
    ],
    "reviewer.eligibility_updated": [
      "Zmenená spôsobilosť",
      "Updated reviewer eligibility",
    ],
    "review.prepare": [
      "Overená príprava rukopisu",
      "Approved manuscript preparation",
    ],
    "review.assign": ["Priradený recenzent", "Assigned reviewer"],
    "review.send": ["Pozvanie zaradené na odoslanie", "Queued invitation"],
    "review.remind": ["Pripomienka zaradená na odoslanie", "Queued reminder"],
    "review.prepare_link": ["Pripravený osobný odkaz", "Prepared private link"],
    "review.cancel": ["Zrušené priradenie", "Cancelled assignment"],
    "review.reopen": ["Znova otvorený posudok", "Reopened report"],
    "review.request_revision": ["Vyžiadaná oprava", "Requested revision"],
    "review.verify_revision": ["Overená oprava", "Verified revision"],
    "review.next_round": ["Začaté ďalšie kolo", "Started another round"],
    "review.decide": ["Zaznamenané rozhodnutie", "Recorded editorial decision"],
    "review.exported": ["Exportované posudky", "Exported reports"],
    "review.portal_viewed": ["Zobrazený dotazník", "Viewed questionnaire"],
    "review.submitted": ["Odovzdaný posudok", "Submitted report"],
    "review.draft_saved": ["Uložený koncept posudku", "Saved report draft"],
    "review.declined": ["Odmietnuté recenzovanie", "Declined review"],
  };
  return (
    labels[action]?.[lng === "en" ? 1 : 0] ||
    tr(lng)("Zaznamenaná aktivita", "Recorded activity")
  );
}
