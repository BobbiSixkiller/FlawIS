"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { z } from "zod";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "./ui/empty";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/table";
import { ReviewError, reviewDate } from "./review-controls";
import { FormDialog } from "./reviews/form-dialog";
import { getReviewDetail } from "@/lib/reviews/actions";
import { mutate, tr, errorText } from "@/lib/reviews/ux";
import { label, stage, type Queue, type QueueRow } from "@/lib/reviews/types";
export { bratislavaDeadline } from "@/lib/reviews/ux";

export default function ConferenceReviewWorkspace({
  initial,
  slug,
  sections,
  enabled,
  canConfigure,
  lng,
}: {
  initial: Queue;
  slug: string;
  sections: { value: string; label: string }[];
  enabled: boolean;
  canConfigure: boolean;
  lng: string;
}) {
  const t = tr(lng);
  const router = useRouter();
  const params = useSearchParams();
  const base = `/conferences/${slug}/reviews`;
  const [pending, start] = useTransition();
  const [selection, setSelection] = useState<string[]>([]);
  const [preview, setPreview] = useState(false);
  const [batchRows, setBatchRows] = useState<QueueRow[]>([]);
  const [outcomes, setOutcomes] = useState<Record<string, string>>({});
  const [successes, setSuccesses] = useState<string[]>([]);
  const [error, setError] = useState("");
  const selected = initial.rows.filter(
    (r) => selection.includes(r.submissionId) && !r.ownPaper,
  );
  const recipients = batchRows.flatMap((row) =>
    row.assignments
      .filter((a) => a.active && a.status === "ASSIGNED")
      .map((a) => ({ row, assignment: a })),
  );
  function navigate(next: URLSearchParams) {
    start(() => router.push(`${base}?${next}`, { scroll: false }));
  }
  const trail = (params.get("trail") || "").split(",").filter(Boolean);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            {t("Recenzné konanie", "Submission reviews")}
          </h1>
          <p className="text-muted-foreground">
            {initial.totalCount} {t("príspevkov", "submissions")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => start(() => router.refresh())}
          >
            {t("Obnoviť", "Refresh")}
          </Button>
        </div>
      </div>
      {!enabled && (
        <Alert>
          <AlertDescription>
            {t(
              "Recenzovanie zatiaľ nie je povolené.",
              "Reviews are not enabled yet.",
            )}{" "}
            {canConfigure && (
              <Link href={`/conferences/${slug}/review-settings`}>
                {t("Otvoriť nastavenia", "Open settings")}
              </Link>
            )}
          </AlertDescription>
        </Alert>
      )}
      <ReviewError message={error} />
      {selection.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <span>
            {selection.length} {t("vybraných", "selected")}
          </span>
          <Button
            variant="outline"
            onClick={() => {
              setBatchRows(selected);
              setPreview(true);
              setOutcomes({});
              setSuccesses([]);
            }}
          >
            {t("Pozvať recenzentov", "Invite reviewers")}
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <a
                href={`/api/conference-review/exports/bulk?submissions=${selection.join(",")}`}
              />
            }
          >
            {t("Exportovať posudky ZIP", "Export reports ZIP")}
          </Button>
          <Button variant="ghost" onClick={() => setSelection([])}>
            {t("Zrušiť výber", "Clear selection")}
          </Button>
        </div>
      )}
      {initial.rows.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  aria-label={t("Vybrať túto stranu", "Select this page")}
                  checked={
                    initial.rows.filter((r) => !r.ownPaper).length > 0 &&
                    initial.rows
                      .filter((r) => !r.ownPaper)
                      .every((r) => selection.includes(r.submissionId))
                  }
                  onCheckedChange={(v) =>
                    setSelection(
                      v
                        ? initial.rows
                            .filter((r) => !r.ownPaper)
                            .slice(0, 50)
                            .map((r) => r.submissionId)
                        : [],
                    )
                  }
                />
              </TableHead>
              <TableHead>
                {t("Príspevok / autori", "Paper / authors")}
              </TableHead>
              <TableHead>{t("Priebeh", "Progress")}</TableHead>
              <TableHead>
                {t("Recenzenti a termíny", "Reviewers and deadlines")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initial.rows.map((row) => (
              <TableRow key={row.submissionId}>
                <TableCell className="align-top">
                  <Checkbox
                    aria-label={`${t("Vybrať", "Select")} ${row.title}`}
                    disabled={
                      row.ownPaper ||
                      (selection.length >= 50 &&
                        !selection.includes(row.submissionId))
                    }
                    checked={selection.includes(row.submissionId)}
                    onCheckedChange={(v) =>
                      setSelection((current) =>
                        v
                          ? [...current, row.submissionId]
                          : current.filter((id) => id !== row.submissionId),
                      )
                    }
                  />
                </TableCell>
                <TableCell className="min-w-60 max-w-md whitespace-normal align-top">
                  <div className="flex flex-col gap-1">
                    {row.ownPaper ? (
                      <span>
                        {lng === "sk" ? row.titleSk || row.title : row.title}
                      </span>
                    ) : (
                      <Link
                        className="font-medium underline underline-offset-4"
                        href={`${base}/${row.submissionId}?returnTo=${encodeURIComponent(`${base}?${params}`)}`}
                      >
                        {lng === "sk" ? row.titleSk || row.title : row.title}
                      </Link>
                    )}
                    <p className="text-muted-foreground">
                      {row.authors.map((a) => a.name).join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sections.find((s) => s.value === row.sectionId)?.label}
                    </p>
                    {row.ownPaper && (
                      <p>
                        {t(
                          "Spravuje nezávislý koordinátor.",
                          "Managed by an independent coordinator.",
                        )}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <div className="flex flex-col items-start gap-2">
                    <Badge variant="secondary">{label(stage(row), lng)}</Badge>
                    {!row.ownPaper && (
                      <span>
                        {
                          row.assignments.filter(
                            (a) => a.status === "SUBMITTED",
                          ).length
                        }
                        /{row.requiredReviews} {t("posudkov", "reports")}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="min-w-56 align-top">
                  <div className="flex flex-col gap-3">
                    {row.assignments.map((a) => (
                      <div key={a.id} className="flex flex-col gap-1">
                        <span>{a.name}</span>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline">
                            {label(a.status, lng)}
                          </Badge>
                          <Badge
                            variant={
                              a.delivery === "FAILED" ||
                              a.delivery === "UNKNOWN"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {a.delivery === "PENDING"
                              ? t("Čaká na odoslanie", "Pending send")
                              : label(a.delivery || "NOT_SENT", lng)}
                          </Badge>
                        </div>
                        {!["SUBMITTED", "DECLINED"].includes(a.status) && (
                          <span className="text-xs">
                            {reviewDate(a.deadline, lng)}
                            {Date.parse(a.deadline) < Date.now()
                              ? ` · ${t("po termíne", "overdue")}`
                              : ""}
                          </span>
                        )}
                      </div>
                    ))}
                    {!row.assignments.length && !row.ownPaper && (
                      <span className="text-muted-foreground">
                        {t(
                          "Čaká na priradenie recenzentov",
                          "Needs reviewer assignment",
                        )}
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              {t("Žiadne zodpovedajúce príspevky", "No matching submissions")}
            </EmptyTitle>
            <EmptyDescription>
              {t(
                "Zmeňte filtre alebo skontrolujte registrácie aktívnych účastníkov.",
                "Change the filters or check active participant registrations.",
              )}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={!params.get("after") || pending}
          onClick={() => {
            const next = new URLSearchParams(params);
            const previous = trail.pop();
            if (previous) next.set("after", previous);
            else next.delete("after");
            next.set("trail", trail.join(","));
            setSelection([]);
            navigate(next);
          }}
        >
          {t("Predchádzajúca strana", "Previous page")}
        </Button>
        <Button
          variant="outline"
          disabled={!initial.hasNextPage || pending}
          onClick={() => {
            const next = new URLSearchParams(params);
            const current = params.get("after");
            if (current) trail.push(current);
            next.set("trail", trail.join(","));
            next.set("after", initial.endCursor!);
            setSelection([]);
            navigate(next);
          }}
        >
          {t("Ďalšia strana", "Next page")}
        </Button>
      </div>
      {preview && (
        <FormDialog
          lng={lng}
          title={t("Pozvať recenzentov", "Invite reviewers")}
          description={t(
            "Odošle sa schválený anonymizovaný rukopis a osobný odkaz. Úspešné pozvania sa pri opakovaní neodošlú znova.",
            "Sends the approved anonymous manuscript and a private link. Successful invitations are not repeated when retrying.",
          )}
          defaultValues={{}}
          schema={z.object({})}
          onClose={() => {
            setPreview(false);
            router.refresh();
          }}
          submitLabel={t(
            "Odoslať čakajúce pozvania",
            "Send pending invitations",
          )}
          keepOpen
          disabled={
            !recipients.some((r) => !successes.includes(r.assignment.id))
          }
          successMessage={t(
            "Pozvania boli spracované. Skontrolujte výsledky.",
            "Invitations processed. Check the results.",
          )}
          onSubmit={async () => {
            const done = [...successes];
            const failed: string[] = [];
            for (const { row, assignment } of recipients) {
              if (done.includes(assignment.id)) continue;
              try {
                const detail = await getReviewDetail(row.submissionId);
                await mutate("review", {
                  submission: row.submissionId,
                  action: "SEND",
                  data: {
                    assignmentId: assignment.id,
                    expectedRevision: detail.review?.revision,
                  },
                });
                done.push(assignment.id);
                setOutcomes((current) => ({
                  ...current,
                  [assignment.id]: t(
                    "E-mail zaradený na odoslanie",
                    "Email queued",
                  ),
                }));
              } catch (e) {
                failed.push(row.submissionId);
                setOutcomes((current) => ({
                  ...current,
                  [assignment.id]: errorText(e, lng),
                }));
              }
            }
            setSuccesses(done);
            setSelection([...new Set(failed)]);
            if (failed.length) {
              setError(
                t(
                  "Niektoré pozvania zlyhali. Výsledky sú v dialógu.",
                  "Some invitations failed. See the dialog results.",
                ),
              );
              throw new Error(
                t(
                  "Opravte uvedené problémy a zopakujte neúspešné pozvania.",
                  "Resolve the listed issues and retry failed invitations.",
                ),
              );
            }
          }}
        >
          {() => (
            <div className="flex flex-col gap-3">
              {recipients.map(({ row, assignment }) => (
                <div key={assignment.id}>
                  <p className="font-medium">{row.title}</p>
                  <p>
                    {assignment.name} · {assignment.email} ·{" "}
                    {reviewDate(assignment.deadline, lng)}
                  </p>
                  <p role="status">{outcomes[assignment.id]}</p>
                </div>
              ))}
              {!recipients.length && (
                <p>
                  {t(
                    "Vybrané príspevky nemajú neodoslané priradenia.",
                    "Selected submissions have no unsent assignments.",
                  )}
                </p>
              )}
            </div>
          )}
        </FormDialog>
      )}
    </div>
  );
}
