"use client";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { BreadcrumbLabel } from "@/components/breadcrumb-labels";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldGroup } from "@/components/ui/field";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ErrorAlert, FieldControl } from "@/components/form/field-controls";
import { formatDate } from "@/lib/date";
import { downloadReviewDocument, uploadReviewFile } from "@/lib/reviews/files";
import { label, type RevisionPortal } from "@/lib/reviews/types";
import { cn } from "@/lib/utils";
import { ProofReviewPortal } from "./proof-review-portal";

type PortalProps = {
  initial: RevisionPortal;
  token?: string;
  submission?: string;
  lng: string;
};

export default function RevisionPortalView(props: PortalProps) {
  if (props.initial.kind === "PROOF" || props.initial.kind === "CHECK")
    return <ProofReviewPortal {...props} />;
  return <CorrectionPortal {...props} />;
}

function CorrectionPortal({ initial, token, submission, lng }: PortalProps) {
  const t = (sk: string, en: string) => (lng === "en" ? en : sk);
  const [request, setRequest] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const [tracked, setTracked] = useState<File | null>(null);
  const [responses, setResponses] = useState<
    Record<
      string,
      { authorStatus?: string; response?: string; location?: string }
    >
  >({});
  const [includeResponses, setIncludeResponses] = useState(false);
  const responsesComplete =
    !includeResponses ||
    request.points?.every((p) => {
      const a = responses[p.id];
      return (
        a?.authorStatus &&
        a.response?.trim() &&
        (a.authorStatus === "notAddressed" || a.location?.trim())
      );
    });
  const paired = request.kind === "POST_REVIEW";
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const [progress, setProgress] = useState(0);
  useUnsavedChanges(
    request.status === "REQUESTED" &&
      Boolean(file || note || tracked || includeResponses),
    lng,
  );
  return (
    <div
      data-page-width={token ? "wide" : undefined}
      className={cn("mx-auto w-full max-w-2xl", !token && "p-4 sm:p-8")}
    >
      {token && (
        <BreadcrumbLabel
          param="token"
          value={token}
          path={`/conferences/revise/${token}`}
          label={t("Oprava príspevku", "Manuscript revision")}
        />
      )}
      <Card>
        <CardHeader>
          <CardTitle>{t("Oprava príspevku", "Manuscript revision")}</CardTitle>
          <CardDescription>
            {t("Termín", "Deadline")}: {formatDate(request.deadline, lng)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 whitespace-pre-line">{request.instructions}</p>
          {request.templateUrl &&
            request.status === "REQUESTED" &&
            (token ? (
              <Button
                variant="outline"
                onClick={() =>
                  downloadReviewDocument(
                    request.templateUrl!,
                    token,
                    true,
                  ).catch((e) => setError(e.message))
                }
              >
                {t(
                  "Stiahnuť šablónu príspevku",
                  "Download manuscript template",
                )}
              </Button>
            ) : (
              <a className="underline" href={request.templateUrl}>
                {t(
                  "Stiahnuť šablónu príspevku",
                  "Download manuscript template",
                )}
              </a>
            ))}
          <ErrorAlert message={error} />
          {request.status === "CANCELLED" ? (
            <p role="status">
              {t("Výzva bola uzavretá.", "This correction request is closed.")}
            </p>
          ) : request.status !== "REQUESTED" ? (
            <div className="space-y-2">
              <p role="status">{label(request.status, lng)}</p>
              {request.points
                ?.filter((p) => p.status !== "PENDING")
                .map((p) => (
                  <p key={p.id}>
                    {p.text} · {label(p.status, lng)}
                  </p>
                ))}
            </div>
          ) : (
            <FieldGroup>
              <FieldControl
                label={t("Opravený rukopis DOCX", "Revised DOCX manuscript")}
                hint={t("Najviac 20 MiB.", "Maximum 20 MiB.")}
              >
                {(id) => (
                  <Input
                    id={id}
                    type="file"
                    accept=".docx"
                    disabled={pending}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                )}
              </FieldControl>
              {paired && (
                <FieldControl
                  label={t(
                    "Rukopis so sledovaním zmien (DOCX)",
                    "Manuscript with tracked changes (DOCX)",
                  )}
                >
                  {(id) => (
                    <Input
                      id={id}
                      type="file"
                      accept=".docx"
                      disabled={pending}
                      onChange={(e) => setTracked(e.target.files?.[0] || null)}
                    />
                  )}
                </FieldControl>
              )}
              {!!request.points?.length && (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeResponses}
                    disabled={pending}
                    onChange={(e) => setIncludeResponses(e.target.checked)}
                  />
                  {t(
                    "Pridať odpoveď ku každému bodu",
                    "Add a response to each point",
                  )}
                </label>
              )}
              {includeResponses &&
                request.points?.map((p) => (
                  <fieldset key={p.id} className="flex flex-col gap-2">
                    <legend>{p.text}</legend>
                    <FieldControl label={t("Výsledok", "Outcome")}>
                      {(id) => (
                        <select
                          id={id}
                          className="rounded-md border bg-background p-2"
                          value={responses[p.id]?.authorStatus || ""}
                          onChange={(e) =>
                            setResponses({
                              ...responses,
                              [p.id]: {
                                ...responses[p.id],
                                authorStatus: e.target.value,
                              },
                            })
                          }
                          disabled={pending}
                        >
                          <option value="">
                            {t("Vyberte výsledok", "Choose an outcome")}
                          </option>
                          <option value="addressed">
                            {t("Zapracované", "Addressed")}
                          </option>
                          <option value="notAddressed">
                            {t("Nezapracované", "Not addressed")}
                          </option>
                        </select>
                      )}
                    </FieldControl>
                    {(["response", "location"] as const).map((key) => (
                      <FieldControl
                        key={key}
                        label={
                          key === "response"
                            ? t("Odpoveď", "Response")
                            : t(
                                "Miesto zapracovanej opravy",
                                "Location of the addressed change",
                              )
                        }
                      >
                        {(id) => (
                          <Input
                            id={id}
                            disabled={pending}
                            maxLength={key === "response" ? 4000 : 500}
                            value={responses[p.id]?.[key] || ""}
                            onChange={(e) =>
                              setResponses({
                                ...responses,
                                [p.id]: {
                                  ...responses[p.id],
                                  [key]: e.target.value,
                                },
                              })
                            }
                          />
                        )}
                      </FieldControl>
                    ))}
                  </fieldset>
                ))}
              <FieldControl
                label={t(
                  "Poznámka pre koordinátora",
                  "Note for the coordinator",
                )}
              >
                {(id) => (
                  <Textarea
                    id={id}
                    maxLength={500}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={pending}
                  />
                )}
              </FieldControl>
            </FieldGroup>
          )}
        </CardContent>
        {request.status === "REQUESTED" && (
          <CardFooter>
            <Button
              disabled={
                !file || (paired && !tracked) || !responsesComplete || pending
              }
              onClick={() =>
                start(async () => {
                  setError("");

                  try {
                    await uploadReviewFile(file!, {
                      kind: "REVISION",
                      onProgress: setProgress,
                      revisionToken: token,
                      submission,
                      note,
                      tracked: tracked || undefined,
                      requestId: request.id,
                      responses: includeResponses ? responses : undefined,
                    });
                    const { getRevisionPortal, getAuthorWorkspace } =
                      await import("@/lib/reviews/actions");

                    if (token) setRequest(await getRevisionPortal(token));
                    else if (submission) {
                      const refreshed = (
                        await getAuthorWorkspace(submission)
                      ).revisions.find((r) => r.id === request.id);
                      if (refreshed) setRequest(refreshed);
                    }
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Upload failed.");
                  }
                })
              }
            >
              {pending
                ? `${t("Nahráva sa", "Uploading")} ${progress}%`
                : t("Odovzdať opravu", "Submit revision")}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
