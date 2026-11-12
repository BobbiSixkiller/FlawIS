"use client";
import { BreadcrumbLabel } from "@/components/breadcrumb-labels";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ErrorAlert } from "@/components/field-controls";
import { formatDate } from "@/lib/date";
import { toast } from "@/components/ui/toast";
import { getReviewDetail, getActivity } from "@/lib/reviews/actions";
import { explain, mutate, errorText } from "@/lib/reviews/ux";
import { localizedText as tr } from "@/lib/i18n/text";
import type {
  ConferenceActivityQuery,
  ConferenceReviewSettingsQuery,
} from "@/lib/graphql/generated/graphql";
import { label, type Detail, type Assignment } from "@/lib/reviews/types";
import ActivityTimeline from "@/app/[lng]/flawis/conferences/[slug]/_components/activity-timeline";
import SubmissionActionDialog, {
  actionTitle,
  type SubmissionAction,
} from "@/app/[lng]/flawis/conferences/[slug]/reviews/[submissionId]/_components/submission-actions";
export default function SubmissionDetail({
  initial,
  slug,
  settings,
  sections,
  lng,
  canManage,
}: {
  initial: Detail;
  slug: string;
  settings: ConferenceReviewSettingsQuery["conferenceReviewSettings"];
  sections: { value: string; label: string }[];
  lng: string;
  canManage: boolean;
}) {
  const t = tr(lng);
  const params = useSearchParams();
  const pathname = usePathname();
  const [detail, setDetail] = useState(initial);
  const [action, setAction] = useState<SubmissionAction | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [activity, setActivity] = useState<
    ConferenceActivityQuery["conferenceActivity"] | null
  >(null);
  const base = `/conferences/${slug}/reviews`;
  const requestedReturn = params.get("returnTo");
  const back = requestedReturn?.startsWith(`${base}?`) ? requestedReturn : base;
  const tab = ["manuscript", "reviews", "decision", "activity"].includes(
    params.get("tab") || "",
  )
    ? params.get("tab")!
    : "manuscript";
  const round = detail.rounds.find((r) => r.id === detail.review?.currentRound);
  const active = round?.assignments.filter((a) => a.active) || [];
  const completed = active.filter((a) => a.status === "SUBMITTED").length;
  async function reload() {
    setDetail(await getReviewDetail(initial.submissionId));
    setActivity(null);
  }
  async function task(fn: () => Promise<unknown>) {
    setPending(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(errorText(e, lng));
    } finally {
      setPending(false);
    }
  }
  function actionButton(
    kind: string,
    secondary = true,
    assignment?: Assignment,
  ) {
    const blocked = detail.blockers[kind];
    return (
      <div className="flex flex-col items-start gap-1">
        <Button
          variant={secondary ? "outline" : "default"}
          disabled={Boolean(blocked) || pending}
          onClick={() => setAction({ kind, assignment })}
        >
          {actionTitle(kind, lng)}
        </Button>
        {blocked && (
          <p className="max-w-sm text-xs text-muted-foreground">
            {explain(blocked, lng)}
          </p>
        )}
      </div>
    );
  }
  const nextInvitation = active.find((a) => a.status === "ASSIGNED");
  const next =
    detail.review?.decision && detail.review.decision !== "PENDING"
      ? null
      : !detail.versions.length
        ? "ORIGINAL"
        : !detail.versions[0]?.anonymousFile
          ? "ANONYMOUS"
          : !detail.review?.formalApproved
            ? "PREPARE"
            : active.length <
                (round?.requiredReviews || settings?.requiredReviews || 2)
              ? "ASSIGN"
              : nextInvitation
                ? "SEND"
                : completed === active.length
                  ? "DECIDE"
                  : null;
  return (
    <div className="flex flex-col gap-6">
      <BreadcrumbLabel
        param="submissionId"
        value={detail.submissionId}
        path={`/flawis/conferences/${slug}/reviews/${detail.submissionId}`}
        label={lng === "sk" ? detail.titleSk || detail.title : detail.title}
      />
      <Link className="w-fit text-sm underline" href={back}>
        {t("← Späť na príspevky", "← Back to submissions")}
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex max-w-3xl flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            {sections.find((s) => s.value === detail.sectionId)?.label}
          </p>
          <h1 className="text-2xl font-semibold">
            {lng === "sk" ? detail.titleSk || detail.title : detail.title}
          </h1>
          <p>{detail.authors.map((a) => a.name).join(", ")}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {label(detail.review?.decision || "PENDING", lng)}
            </Badge>
            <Badge variant="outline">
              {t("Kolo", "Round")} {round?.number || 0} · {completed}/
              {round?.requiredReviews || settings?.requiredReviews || 2}{" "}
              {t("posudkov", "reports")}
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {next &&
            actionButton(
              next,
              false,
              next === "SEND" ? nextInvitation : undefined,
            )}
          <Button
            variant="ghost"
            disabled={pending}
            onClick={() => task(reload)}
          >
            {t("Obnoviť údaje", "Refresh details")}
          </Button>
        </div>
      </div>
      <ErrorAlert message={error} />
      <Tabs
        value={tab}
        onValueChange={(value) => {
          const nextParams = new URLSearchParams(params);
          nextParams.set("tab", String(value));
          window.history.replaceState(null, "", `${pathname}?${nextParams}`);
          if (value === "activity" && activity === null)
            void task(async () =>
              setActivity(
                await getActivity(detail.conferenceId, detail.submissionId),
              ),
            );
        }}
      >
        <TabsList
          variant="line"
          className="h-auto w-full justify-start overflow-x-auto"
        >
          {[
            ["manuscript", t("Rukopis", "Manuscript")],
            ["reviews", t("Recenzie", "Reviews")],
            ["decision", t("Opravy a rozhodnutie", "Revisions and decision")],
            ["activity", t("História", "Activity")],
          ].map(([value, title]) => (
            <TabsTrigger key={value} value={value}>
              {title}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="manuscript" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("Príprava rukopisu", "Manuscript preparation")}
              </CardTitle>
              <CardDescription>
                {t(
                  "Originály a anonymizované kópie zostávajú vo verziách.",
                  "Originals and anonymous copies are preserved as versions.",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {detail.requirements && (
                <Alert>
                  <AlertDescription className="whitespace-pre-line">
                    {detail.requirements}
                  </AlertDescription>
                </Alert>
              )}
              {detail.review?.formalNotes && (
                <p className="whitespace-pre-line">
                  {detail.review.formalNotes}
                </p>
              )}
              {detail.versions.map((v) => (
                <div
                  key={v.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">v{v.number}</Badge>
                    <span>{formatDate(v.createdAt, lng)}</span>
                    {v.anonymousApproved && (
                      <Badge variant="secondary">
                        {t("Anonymizácia overená", "Anonymity approved")}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <a
                      className="underline"
                      href={`/api/conference-review/files/${v.file}`}
                    >
                      {t("Originál", "Original")}
                    </a>
                    {v.anonymousFile && (
                      <a
                        className="underline"
                        href={`/api/conference-review/files/${v.anonymousFile}`}
                      >
                        {t("Anonymizovaná kópia", "Anonymous copy")}
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {!detail.versions.length && (
                <p>
                  {t(
                    "Rukopis zatiaľ nie je zaregistrovaný v recenznom konaní.",
                    "No manuscript is registered for reviewing yet.",
                  )}
                </p>
              )}
            </CardContent>
            <CardFooter className="flex-wrap items-start gap-3">
              {!detail.versions.length && actionButton("ADOPT")}
              {actionButton("ORIGINAL")}
              {actionButton("ANONYMOUS")}
              {actionButton("PREPARE")}
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="reviews" className="flex flex-col gap-4 pt-4">
          {actionButton("ASSIGN", false)}
          {detail.rounds.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <CardTitle>
                  {t("Kolo", "Round")} {r.number} ·{" "}
                  {r.id === detail.review?.currentRound
                    ? t("aktuálne", "current")
                    : t("história", "history")}
                </CardTitle>
                <CardDescription>
                  {
                    r.assignments.filter(
                      (a) => a.active && a.status === "SUBMITTED",
                    ).length
                  }
                  /{r.requiredReviews} {t("posudkov", "reports")} ·{" "}
                  {t("Dotazník", "Questionnaire")} v{r.questionnaire.version}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                {r.assignments.map((a) => (
                  <div
                    key={a.id}
                    className="flex flex-col gap-3 rounded-lg border p-4"
                  >
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <p className="font-medium">
                          {a.slot}. {a.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {a.email} · {formatDate(a.deadline, lng)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-start gap-1">
                        <Badge variant="outline">{label(a.status, lng)}</Badge>
                        <Badge variant="secondary">
                          {t("E-mail", "Email")}:{" "}
                          {a.delivery === "PENDING"
                            ? t("čaká na odoslanie", "pending send")
                            : label(a.delivery || "NOT_SENT", lng)}
                        </Badge>
                        {a.recommendation && (
                          <Badge>{label(a.recommendation, lng)}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setAction({ kind: "REPORT", assignment: a })
                        }
                      >
                        {a.status === "SUBMITTED"
                          ? t("Zobraziť posudok", "View report")
                          : t("Vložiť posudok", "Enter report")}
                      </Button>
                      {a.status === "SUBMITTED" && (
                        <Button
                          variant="ghost"
                          nativeButton={false}
                          render={
                            <a
                              href={`/api/conference-review/exports/${detail.submissionId}?report=${a.id}`}
                            />
                          }
                        >
                          {t("Stiahnuť DOCX", "Download DOCX")}
                        </Button>
                      )}
                      {a.active &&
                        r.id === detail.review?.currentRound &&
                        detail.review?.decision === "PENDING" && (
                          <>
                            {!["SUBMITTED", "DECLINED"].includes(a.status) && (
                              <>
                                <Button
                                  disabled={Boolean(detail.blockers.SEND)}
                                  onClick={() =>
                                    setAction({
                                      kind:
                                        a.status === "ASSIGNED"
                                          ? "SEND"
                                          : "REMIND",
                                      assignment: a,
                                    })
                                  }
                                >
                                  {actionTitle(
                                    a.status === "ASSIGNED" ? "SEND" : "REMIND",
                                    lng,
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  disabled={
                                    pending ||
                                    Boolean(detail.blockers.PREPARE_LINK)
                                  }
                                  onClick={() =>
                                    task(async () => {
                                      const result = await mutate<{
                                        url: string;
                                      }>("review", {
                                        submission: detail.submissionId,
                                        action: "PREPARE_LINK",
                                        data: {
                                          assignmentId: a.id,
                                          expectedRevision:
                                            detail.review?.revision,
                                        },
                                      });
                                      await navigator.clipboard.writeText(
                                        result.url,
                                      );
                                      await reload();
                                      toast.add({
                                        title: t(
                                          "Odkaz skopírovaný. E-mail sa neodoslal.",
                                          "Link copied. No email sent.",
                                        ),
                                        type: "success",
                                      });
                                    })
                                  }
                                >
                                  {t("Kopírovať odkaz", "Copy link")}
                                </Button>
                                <Button
                                  variant="ghost"
                                  nativeButton={false}
                                  render={
                                    <a
                                      href={`/api/conference-review/exports/${detail.submissionId}?round=${r.id}&package=${a.id}`}
                                    />
                                  }
                                >
                                  {t("Stiahnuť balík", "Download package")}
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              onClick={() =>
                                setAction({
                                  kind:
                                    a.status === "SUBMITTED"
                                      ? "REOPEN"
                                      : "CANCEL",
                                  assignment: a,
                                })
                              }
                            >
                              {actionTitle(
                                a.status === "SUBMITTED" ? "REOPEN" : "CANCEL",
                                lng,
                              )}
                            </Button>
                          </>
                        )}
                    </div>
                    {detail.blockers.SEND && a.active && (
                      <p className="text-xs text-muted-foreground">
                        {explain(detail.blockers.SEND, lng)}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={
                    <a
                      href={`/api/conference-review/exports/${detail.submissionId}?round=${r.id}`}
                    />
                  }
                >
                  {t(
                    "Exportovať posudky tohto kola",
                    "Export this round’s reports",
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="decision" className="flex flex-col gap-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("Opravy rukopisu", "Manuscript revisions")}
              </CardTitle>
              <CardDescription>
                {t(
                  "Po prijatí opravy ju overte pred rozhodnutím o prijatí.",
                  "Verify a received revision before accepting the submission.",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {detail.revisions.map((r) => (
                <div key={r.id} className="flex flex-col gap-2">
                  <div>
                    <Badge variant="outline">{label(r.status, lng)}</Badge> ·{" "}
                    {formatDate(r.deadline, lng)}
                  </div>
                  <p className="whitespace-pre-line">{r.instructions}</p>
                  {r.note && <p>{r.note}</p>}
                  {r.receivedVersion &&
                    detail.versions.find((v) => v.id === r.receivedVersion) && (
                      <a
                        className="underline"
                        href={`/api/conference-review/files/${detail.versions.find((v) => v.id === r.receivedVersion)!.file}`}
                      >
                        {t("Opravený rukopis", "Revised manuscript")}
                      </a>
                    )}
                  {r.status === "RECEIVED" && (
                    <Button
                      className="w-fit"
                      onClick={() =>
                        setAction({ kind: "VERIFY_REVISION", requestId: r.id })
                      }
                    >
                      {actionTitle("VERIFY_REVISION", lng)}
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex-wrap items-start gap-3">
              {actionButton("REQUEST_REVISION")}
              {actionButton("NEXT_ROUND")}
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                {t("Redakčné rozhodnutie", "Editorial decision")}
              </CardTitle>
              <CardDescription>
                {t(
                  "Rozhodnutie je nezávislé od odporúčaní recenzentov.",
                  "The editorial decision is separate from reviewer recommendations.",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge>{label(detail.review?.decision || "PENDING", lng)}</Badge>
              {detail.review?.decisionReason && (
                <p className="mt-3 whitespace-pre-line">
                  {detail.review.decisionReason}
                </p>
              )}
            </CardContent>
            <CardFooter>{actionButton("DECIDE", false)}</CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="activity" className="pt-4">
          {activity === null ? (
            <Button
              disabled={pending}
              onClick={() =>
                task(async () =>
                  setActivity(
                    await getActivity(detail.conferenceId, detail.submissionId),
                  ),
                )
              }
            >
              {t("Načítať históriu", "Load activity")}
            </Button>
          ) : (
            <ActivityTimeline
              key={activity[0]?.id || "empty"}
              initial={activity}
              conference={detail.conferenceId}
              submission={detail.submissionId}
              lng={lng}
            />
          )}
        </TabsContent>
      </Tabs>
      {action && (
        <SubmissionActionDialog
          key={`${detail.submissionId}:${action.kind}:${action.assignment?.id || action.requestId || ""}`}
          action={action}
          detail={detail}
          settings={settings}
          sections={sections}
          lng={lng}
          canManage={canManage}
          onClose={() => setAction(null)}
          onSaved={async () => {
            try {
              await reload();
            } catch {
              setError(
                t(
                  "Zmeny boli uložené, ale obnovenie údajov zlyhalo. Obnovte údaje pred ďalšou úpravou.",
                  "Changes were saved, but refreshing failed. Refresh details before making another change.",
                ),
              );
            }
          }}
        />
      )}
    </div>
  );
}
