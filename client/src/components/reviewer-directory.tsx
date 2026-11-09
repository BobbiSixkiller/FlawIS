"use client";
import { useState } from "react";
import { z } from "zod";
import { getReviewerDirectory } from "@/lib/reviews/actions";
import { mutate, tr, errorText } from "@/lib/reviews/ux";
import type { ReviewerPage, ReviewerRecord } from "@/lib/reviews/types";
import { reviewerCsv, parseReviewerCsv } from "@/lib/reviews/csv";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "./ui/table";
import { Empty, EmptyHeader, EmptyTitle } from "./ui/empty";
import { ReviewError, ReviewField } from "./review-controls";
import { FormDialog, TextField, ConfirmDialog } from "./reviews/form-dialog";
import ReviewerTags from "./reviews/reviewer-tags";
import ReviewerProfileView from "./reviewer-profile";
type ImportRow = {
  data: Record<string, string>;
  existing?: ReviewerRecord;
  status: "new" | "update" | "invalid" | "saved" | "failed";
  error?: string;
};
export default function ReviewerDirectory({
  initial,
  search,
  canManage,
  lng,
}: {
  initial: ReviewerPage;
  search: string;
  canManage: boolean;
  lng: string;
}) {
  const t = tr(lng);
  const [page, setPage] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<ReviewerRecord | "new" | null>(null);
  const [archiving, setArchiving] = useState<ReviewerRecord | null>(null);
  const [importing, setImporting] = useState(false);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [previewing, setPreviewing] = useState(false);
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
  async function reload() {
    setPage(await getReviewerDirectory(search));
  }
  async function allRecords(query: string, status?: boolean) {
    let result = await getReviewerDirectory(query, undefined, status);
    const records = [...result.rows];
    while (result.hasNextPage) {
      result = await getReviewerDirectory(
        query,
        result.endCursor || undefined,
        status,
      );
      records.push(...result.rows);
    }
    return records;
  }
  const schema = z.object({
    name: z.string().trim().min(1, t("Zadajte meno.", "Enter a name.")),
    email: z.email(t("Zadajte platný e-mail.", "Enter a valid email.")),
    institution: z.string(),
    department: z.string(),
    languages: z.array(z.string()),
    expertise: z.array(z.string()),
    notes: z.string(),
  });
  const existing = editing && editing !== "new" ? editing : null;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            {t("Databáza recenzentov", "Reviewer directory")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "Spoločná pre všetky konferencie. Archivácia zachová históriu.",
              "Shared across conferences. Archiving preserves history.",
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={pending}
            onClick={() =>
              task(async () => {
                const records = await allRecords(search);
                const url = URL.createObjectURL(
                  new Blob(["\uFEFF", reviewerCsv(records)], {
                    type: "text/csv;charset=utf-8",
                  }),
                );
                const a = document.createElement("a");
                a.href = url;
                a.download = "reviewers.csv";
                a.click();
                URL.revokeObjectURL(url);
              })
            }
          >
            {t(
              "Exportovať zodpovedajúcich recenzentov",
              "Export matching reviewers",
            )}
          </Button>
          {canManage && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setRows([]);
                  setImporting(true);
                }}
              >
                {t("Importovať CSV", "Import CSV")}
              </Button>
              <Button onClick={() => setEditing("new")}>
                {t("Pridať recenzenta", "Add reviewer")}
              </Button>
            </>
          )}
        </div>
      </div>
      <ReviewError message={error} />
      <p className="text-sm text-muted-foreground">
        {page.totalCount} {t("recenzentov", "reviewers")}
      </p>
      <Table className="max-md:block">
        <TableHeader className="max-md:hidden">
          <TableRow>
            {[
              t("Recenzent", "Reviewer"),
              t("Pracovisko", "Affiliation"),
              t("Jazyky a odbornosť", "Languages and expertise"),
              t("Akcie", "Actions"),
            ].map((title) => (
              <TableHead key={title}>{title}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="max-md:flex max-md:flex-col max-md:gap-4">
          {page.rows.map((r) => (
            <TableRow
              key={r.id}
              className="max-md:flex max-md:flex-col max-md:rounded-lg max-md:border max-md:p-2"
            >
              <TableCell className="align-top">
                <p className="font-medium">
                  {r.name}{" "}
                  {r.archived && (
                    <Badge variant="outline">{t("Archív", "Archived")}</Badge>
                  )}
                </p>
                <p className="text-muted-foreground">{r.email}</p>
              </TableCell>
              <TableCell className="whitespace-normal align-top">
                {r.institution}
                <p className="text-muted-foreground">{r.department}</p>
              </TableCell>
              <TableCell className="align-top">
                <div className="flex max-w-sm flex-wrap gap-1">
                  {r.languages.map((v) => (
                    <Badge key={v} variant="secondary">
                      {v}
                    </Badge>
                  ))}
                  {r.expertise.map((v) => (
                    <Badge key={v} variant="outline">
                      {v}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="align-top">
                <div className="flex flex-wrap gap-1">
                  <ReviewerProfileView reviewer={r.id} lng={lng} />
                  {canManage && (
                    <>
                      <Button variant="outline" onClick={() => setEditing(r)}>
                        {t("Upraviť", "Edit")}
                      </Button>
                      <Button variant="ghost" onClick={() => setArchiving(r)}>
                        {r.archived
                          ? t("Obnoviť", "Restore")
                          : t("Archivovať", "Archive")}
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!page.rows.length && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              {t("Žiadni zodpovedajúci recenzenti", "No matching reviewers")}
            </EmptyTitle>
          </EmptyHeader>
        </Empty>
      )}
      {page.hasNextPage && (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() =>
            task(async () => {
              const next = await getReviewerDirectory(
                search,
                page.endCursor || undefined,
              );
              setPage({ ...next, rows: [...page.rows, ...next.rows] });
            })
          }
        >
          {t("Načítať ďalších", "Load more")}
        </Button>
      )}
      {editing && (
        <FormDialog
          key={existing?.id || "new"}
          title={
            existing
              ? t("Upraviť recenzenta", "Edit reviewer")
              : t("Nový recenzent", "New reviewer")
          }
          lng={lng}
          schema={schema}
          defaultValues={
            existing || {
              name: "",
              email: "",
              institution: "",
              department: "",
              languages: [],
              expertise: [],
              notes: "",
            }
          }
          onClose={() => setEditing(null)}
          onSubmit={async (data) => {
            await mutate("reviewer", {
              id: existing?.id,
              data: { ...data, archived: existing?.archived || false },
            });
            await reload();
          }}
        >
          {(form) => (
            <>
              <TextField
                name="name"
                label={t("Meno a tituly", "Name and titles")}
              />
              <TextField name="email" label="E-mail" type="email" />
              <TextField
                name="institution"
                label={t("Inštitúcia / fakulta", "Institution / faculty")}
              />
              <TextField
                name="department"
                label={t("Pracovisko", "Department")}
              />
              <ReviewerTags
                name="languages"
                suggestions={[
                  "sk",
                  "en",
                  "cs",
                  "de",
                  "fr",
                  "pl",
                  ...page.rows.flatMap((r) => r.languages),
                ]}
                lng={lng}
                label={t("Jazyky", "Languages")}
                value={form.watch("languages")}
                onChange={(v) =>
                  form.setValue("languages", v, { shouldDirty: true })
                }
              />
              <ReviewerTags
                name="expertise"
                suggestions={page.rows.flatMap((r) => r.expertise)}
                lng={lng}
                label={t("Odbornosť", "Expertise")}
                value={form.watch("expertise")}
                onChange={(v) =>
                  form.setValue("expertise", v, { shouldDirty: true })
                }
              />
              <TextField
                name="notes"
                multiline
                label={t("Interné poznámky", "Internal notes")}
              />
            </>
          )}
        </FormDialog>
      )}
      {archiving && (
        <ConfirmDialog
          lng={lng}
          title={
            archiving.archived
              ? t("Obnoviť recenzenta", "Restore reviewer")
              : t("Archivovať recenzenta", "Archive reviewer")
          }
          description={`${archiving.name}. ${t("História a existujúce priradenia zostanú zachované.", "History and existing assignments are preserved.")}`}
          onClose={() => setArchiving(null)}
          onConfirm={async () => {
            await mutate("reviewer", {
              id: archiving.id,
              data: { ...archiving, archived: !archiving.archived },
            });
            await reload();
          }}
        />
      )}
      {importing && (
        <FormDialog
          title={t("Importovať recenzentov", "Import reviewers")}
          lng={lng}
          wide
          schema={z.object({})}
          defaultValues={{}}
          busy={previewing}
          disabled={
            !rows.some((r) => ["new", "update", "failed"].includes(r.status))
          }
          onClose={() => {
            setImporting(false);
            void task(reload);
          }}
          keepOpen
          submitLabel={t(
            "Importovať platné a neúspešné riadky",
            "Import valid and failed rows",
          )}
          successMessage={t(
            "Import spracovaný. Skontrolujte výsledky riadkov.",
            "Import processed. Check row results.",
          )}
          onSubmit={async () => {
            const next = [...rows];
            for (let i = 0; i < next.length; i++) {
              const row = next[i];
              if (!["new", "update", "failed"].includes(row.status)) continue;
              try {
                await mutate("reviewer", {
                  id: row.existing?.id,
                  data: {
                    ...row.existing,
                    ...row.data,
                    archived: row.existing?.archived || false,
                    languages:
                      row.data.languages === undefined
                        ? row.existing?.languages || []
                        : row.data.languages
                            .split(";")
                            .map((v) => v.trim())
                            .filter(Boolean),
                    expertise:
                      row.data.expertise === undefined
                        ? row.existing?.expertise || []
                        : row.data.expertise
                            .split(";")
                            .map((v) => v.trim())
                            .filter(Boolean),
                  },
                });
                next[i] = { ...row, status: "saved", error: undefined };
              } catch (e) {
                next[i] = {
                  ...row,
                  status: "failed",
                  error: errorText(e, lng),
                };
              }
              setRows([...next]);
            }
            if (next.some((r) => r.status === "failed"))
              throw new Error(
                t(
                  "Niektoré riadky zlyhali. Zopakujte ich import.",
                  "Some rows failed. Retry their import.",
                ),
              );
          }}
        >
          {() => (
            <>
              <ReviewField
                label="CSV"
                hint="name,email,institution,department,languages,expertise,notes"
              >
                {(id) => (
                  <Input
                    id={id}
                    type="file"
                    accept=".csv,text/csv"
                    disabled={
                      previewing || rows.some((r) => r.status === "saved")
                    }
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setPreviewing(true);
                      try {
                        const data = parseReviewerCsv(await file.text());
                        const existing = new Map(
                          (await allRecords("")).map((r) => [
                            r.email.toLowerCase(),
                            r,
                          ]),
                        );
                        const seen = new Set<string>();
                        setRows(
                          data.map((row) => {
                            row.email = row.email.trim().toLowerCase();
                            const duplicate = seen.has(row.email);
                            seen.add(row.email);
                            const valid = Boolean(
                              row.name?.trim() &&
                              z.email().safeParse(row.email).success &&
                              !duplicate,
                            );
                            return {
                              data: row,
                              existing: existing.get(row.email),
                              status: !valid
                                ? "invalid"
                                : existing.has(row.email)
                                  ? "update"
                                  : "new",
                              error: !valid
                                ? t(
                                    "Chýba meno, neplatný alebo duplicitný e-mail.",
                                    "Missing name, invalid or duplicate email.",
                                  )
                                : undefined,
                            };
                          }),
                        );
                      } catch (e) {
                        setRows([
                          {
                            data: { name: file.name, email: "" },
                            status: "invalid",
                            error: errorText(e, lng),
                          },
                        ]);
                      } finally {
                        setPreviewing(false);
                      }
                    }}
                  />
                )}
              </ReviewField>
              <p>
                {t(
                  "Archivovaní recenzenti zostanú archivovaní. Úspešné riadky sa pri opakovaní preskočia.",
                  "Archived reviewers remain archived. Successful rows are skipped when retrying.",
                )}
              </p>
              {rows.map((row, index) => (
                <div
                  key={index}
                  className="flex flex-wrap items-start justify-between gap-2"
                >
                  <div>
                    <p>
                      {index + 1}. {row.data.name} · {row.data.email}
                    </p>
                    {row.error && <p role="alert">{row.error}</p>}
                  </div>
                  <Badge
                    variant={
                      row.status === "invalid" || row.status === "failed"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {
                      {
                        new: t("Nový", "New"),
                        update: t("Aktualizácia", "Update"),
                        invalid: t("Neplatný", "Invalid"),
                        saved: t("Uložený", "Saved"),
                        failed: t("Zlyhal", "Failed"),
                      }[row.status]
                    }
                  </Badge>
                </div>
              ))}
            </>
          )}
        </FormDialog>
      )}
    </div>
  );
}
