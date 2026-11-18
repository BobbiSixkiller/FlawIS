"use client";

import { useState, useTransition } from "react";
import { BreadcrumbLabel } from "@/components/breadcrumb-labels";
import { FieldControl, ErrorAlert } from "@/components/form/field-controls";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { formatDate } from "@/lib/date";
import { localizedText } from "@/lib/i18n/text";
import { downloadReviewerFile } from "@/lib/reviews/files";
import { label, type RevisionPortal } from "@/lib/reviews/types";
import { cn } from "@/lib/utils";

export function ProofReviewPortal({
  initial,
  token,
  lng,
}: {
  initial: RevisionPortal;
  token?: string;
  lng: string;
}) {
  const t = localizedText(lng);
  const [request, setRequest] = useState(initial);
  const [checks, setChecks] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const check = request.kind === "CHECK";
  const open = request.status === (check ? "CHECK_PENDING" : "REQUESTED");
  const title = check
    ? t("Overenie opráv recenzentom", "Review manuscript corrections")
    : t("Autorská korektúra", "Final author proof");
  const documents = check
    ? [
        [
          request.manuscriptFile,
          t("Anonymizovaný čistý rukopis", "Anonymous clean manuscript"),
        ],
        [
          request.trackedFile,
          t("Anonymizované sledované zmeny", "Anonymous tracked changes"),
        ],
      ]
    : [
        [
          request.manuscriptFile,
          t("Finálny rukopis (DOCX)", "Final manuscript (DOCX)"),
        ],
        [request.proofPdf, t("Korektúra (PDF)", "Page proof (PDF)")],
      ];

  useUnsavedChanges(open && Object.keys(checks).length > 0, lng);

  function submit() {
    start(async () => {
      setError("");

      try {
        const response = await fetch(
          check
            ? "/api/conference-review/files/check"
            : "/api/conference-review/files/proof/" + request.id,
          {
            method: "POST",
            headers: {
              ...(check ? { "content-type": "application/json" } : {}),
              ...(token ? { "x-revision-token": token } : {}),
            },
            body: check ? JSON.stringify({ checks }) : undefined,
          },
        );
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);

        setRequest(check ? { ...request, status: "CHECK_SUBMITTED" } : result);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : t("Operácia zlyhala.", "The request failed."),
        );
      }
    });
  }

  return (
    <div
      data-page-width={token ? "wide" : undefined}
      className={cn("mx-auto w-full max-w-2xl", !token && "p-4 sm:p-8")}
    >
      {token && (
        <BreadcrumbLabel
          param="token"
          value={token}
          path={"/conferences/revise/" + token}
          label={title}
        />
      )}
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {request.versionNumber && (
              <>
                {t("Verzia", "Version")} {request.versionNumber} ·{" "}
              </>
            )}
            {t("Termín", "Deadline")} {formatDate(request.deadline, lng)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {!check && <p>{request.instructions}</p>}
          {documents.map(
            ([id, name]) =>
              id &&
              (token ? (
                <Button
                  key={id}
                  variant="outline"
                  onClick={() =>
                    downloadReviewerFile(id, token, true).catch((e) =>
                      setError(e.message),
                    )
                  }
                >
                  {name}
                </Button>
              ) : (
                <a
                  key={id}
                  className="underline"
                  href={"/api/conference-review/files/" + id}
                >
                  {name}
                </a>
              )),
          )}
          {check &&
            request.points?.map((point) => (
              <FieldControl
                key={point.id}
                label={point.text}
                hint={[point.response, point.location]
                  .filter(Boolean)
                  .join(" · ")}
              >
                {(id) => (
                  <select
                    className="w-full rounded-md border bg-background p-2"
                    id={id}
                    disabled={!open || pending}
                    value={checks[point.id] || (open ? "" : point.status)}
                    onChange={(e) =>
                      setChecks({ ...checks, [point.id]: e.target.value })
                    }
                  >
                    <option value="">
                      {t("Vyberte výsledok", "Choose a result")}
                    </option>
                    <option value="VERIFIED">{t("Overené", "Verified")}</option>
                    <option value="NEEDS_CHANGES">
                      {t("Vyžaduje opravu", "Needs changes")}
                    </option>
                  </select>
                )}
              </FieldControl>
            ))}
          <ErrorAlert message={error} />
        </CardContent>
        <CardFooter>
          {open ? (
            <Button
              disabled={
                pending ||
                (check &&
                  (!token || !request.points?.every((p) => checks[p.id])))
              }
              onClick={submit}
            >
              {check
                ? t("Odovzdať kontrolu", "Submit check")
                : t(
                    "Schvaľujem túto verziu na vydanie",
                    "I approve this version for publication",
                  )}
            </Button>
          ) : (
            <p role="status">{label(request.status, lng)}</p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
