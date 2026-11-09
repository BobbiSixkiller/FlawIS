"use client";
import { useUnsavedChanges } from "./reviews/form-dialog";
import { BreadcrumbLabel } from "./breadcrumb-labels";
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
import { ReviewError, ReviewField, reviewDate } from "./review-controls";
import { uploadReviewFile } from "@/lib/reviews/files";
import { getRevisionPortal, getAuthorWorkspace } from "@/lib/reviews/actions";
import type { RevisionPortal } from "@/lib/reviews/types";
import { cn } from "@/lib/utils";
export default function RevisionPortalView({
  initial,
  token,
  submission,
  lng,
}: {
  initial: RevisionPortal;
  token?: string;
  submission?: string;
  lng: string;
}) {
  const t = (sk: string, en: string) => (lng === "en" ? en : sk);
  const [request, setRequest] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const [progress, setProgress] = useState(0);
  useUnsavedChanges(
    request.status === "REQUESTED" && Boolean(file || note),
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
            {t("Termín", "Deadline")}: {reviewDate(request.deadline, lng)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 whitespace-pre-line">{request.instructions}</p>
          <ReviewError message={error} />
          {request.status === "CANCELLED" ? (
            <p role="status">
              {t("Výzva bola uzavretá.", "This correction request is closed.")}
            </p>
          ) : request.status !== "REQUESTED" ? (
            <p role="status">
              {t(
                "Oprava bola doručená. Koordinátor ju skontroluje.",
                "Your revision was received. The coordinator will check it.",
              )}
            </p>
          ) : (
            <FieldGroup>
              <ReviewField
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
              </ReviewField>
              <ReviewField
                label={t(
                  "Poznámka pre koordinátora",
                  "Note for the coordinator",
                )}
              >
                {(id) => (
                  <Textarea
                    id={id}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={pending}
                  />
                )}
              </ReviewField>
            </FieldGroup>
          )}
        </CardContent>
        {request.status === "REQUESTED" && (
          <CardFooter>
            <Button
              disabled={!file || pending}
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
                    });
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
