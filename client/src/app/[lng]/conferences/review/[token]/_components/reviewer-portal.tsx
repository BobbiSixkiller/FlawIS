"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/form/form-dialog";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { mutate, errorText } from "@/lib/reviews/ux";
import { AnswerFields, validateAnswerFields } from "@/components/form/answer-fields";
import { ErrorAlert } from "@/components/form/field-controls";
import { formatDate } from "@/lib/date";
import { downloadReviewerFile, uploadReviewFile } from "@/lib/reviews/files";
import { label, type Portal } from "@/lib/reviews/types";
import { BreadcrumbLabel } from "@/components/breadcrumb-labels";
export default function ReviewerPortal({
  initial,
  token,
  lng,
}: {
  initial: Portal;
  token: string;
  lng: string;
}) {
  const t = (sk: string, en: string) => (lng === "en" ? en : sk);
  const [portal, setPortal] = useState(initial);
  const [values, setValues] = useState(initial.answer?.answers || {});
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [confirm, setConfirm] = useState<"submit" | "decline" | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const dirty =
    JSON.stringify(values) !== JSON.stringify(portal.answer?.answers || {});
  useUnsavedChanges(dirty, lng);
  const [pending, start] = useTransition();
  const closed = portal.status === "SUBMITTED" || portal.status === "DECLINED";
  function task(operation: () => Promise<unknown>) {
    start(async () => {
      setError("");
      try {
        await operation();
      } catch (e) {
        setError(errorText(e, lng));
      }
    });
  }
  async function save(submit: boolean) {
    if (submit) {
      const errors = validateAnswerFields(portal.form.fields, values, lng);
      setFieldErrors(errors);
      if (Object.keys(errors).length)
        throw new Error(
          t(
            "Vyplňte označené povinné odpovede.",
            "Complete the highlighted required answers.",
          ),
        );
    }
    const result = await mutate<{ answer: NonNullable<Portal["answer"]> }>(
      "report",
      {
        token,
        answers: values,
        submit,
        expectedRevision: portal.answer?.revision,
      },
    );
    setPortal((current) => ({
      ...current,
      answer: result.answer,
      status: submit ? "SUBMITTED" : "STARTED",
    }));
    setValues(result.answer.answers);
    setSaved(true);
    setLastSaved(
      new Date().toLocaleTimeString(lng === "en" ? "en-GB" : "sk-SK"),
    );
    setConfirm(null);
  }
  return (
    <div data-page-width="wide" className="mx-auto flex w-full flex-col gap-6">
      <BreadcrumbLabel
        param="token"
        value={token}
        path={`/conferences/review/${token}`}
        label={t("Recenzný posudok", "Review report")}
      />
      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle>{t("Recenzný posudok", "Review report")}</CardTitle>
          <CardDescription>
            {t("Termín odovzdania", "Due date")}:{" "}
            {formatDate(portal.deadline, lng)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Badge variant="secondary">{label(portal.status, lng)}</Badge>
          <p>
            {t(
              "Odpovede označené pre autora sa sprístupnia po doručení všetkých posudkov. V pripomienkach neuvádzajte svoju identitu.",
              "Author-facing feedback is released once all required reports arrive. Avoid identifying yourself in comments.",
            )}
          </p>
          {portal.manuscriptFileId && (
            <Button
              variant="outline"
              disabled={pending || uploading}
              onClick={() =>
                task(() =>
                  downloadReviewerFile(portal.manuscriptFileId!, token),
                )
              }
            >
              {t(
                "Stiahnuť anonymizovaný rukopis",
                "Download anonymized manuscript",
              )}
            </Button>
          )}
          {portal.attachments?.map((file) => (
            <Button
              key={file.id}
              variant="link"
              onClick={() => task(() => downloadReviewerFile(file.id, token))}
            >
              {file.filename}
            </Button>
          ))}
          <ErrorAlert message={error} />
          {saved && (
            <p role="status" className="text-muted-foreground">
              {closed
                ? t(
                    "Posudok bol uložený a odovzdaný.",
                    "Your report was saved and submitted.",
                  )
                : t("Koncept je uložený.", "Draft saved.")}
            </p>
          )}
          {lastSaved && (
            <p role="status">
              {t("Naposledy uložené", "Last saved")}: {lastSaved}
            </p>
          )}
          {dirty && !closed && (
            <p role="status">
              {t("Máte neuložené zmeny.", "You have unsaved changes.")}
            </p>
          )}
          <AnswerFields
            lng={lng}
            fieldAnnotations={Object.fromEntries(
              portal.form.fields.map((field) => [
                field.id,
                <Badge key={field.id} variant="outline">
                  {portal.authorFields.includes(field.id)
                    ? t("Viditeľné autorom", "Visible to authors")
                    : t("Iba koordinátori", "Coordinators only")}
                </Badge>,
              ]),
            )}
            attachments={portal.attachments}
            errors={fieldErrors}
            onUploadingChange={setUploading}
            fields={portal.form.fields}
            values={values}
            disabled={closed || pending || uploading}
            onChange={(key, value) => {
              setValues((current) => ({ ...current, [key]: value }));
              setSaved(false);
            }}
            upload={async (file, onProgress) => {
              try {
                return (
                  await uploadReviewFile(file, {
                    kind: "REPORT",
                    reviewerToken: token,
                    onProgress,
                  })
                ).id;
              } catch (e) {
                setError(e instanceof Error ? e.message : "Upload failed.");
                throw e;
              }
            }}
          />
        </CardContent>
        {!closed && (
          <CardFooter className="sticky bottom-0 flex-wrap gap-2 border-t bg-card py-3">
            <Button
              variant="outline"
              disabled={pending || uploading}
              onClick={() => task(() => save(false))}
            >
              {t("Uložiť koncept", "Save draft")}
            </Button>
            <Button
              disabled={pending || uploading}
              onClick={() => {
                const errors = validateAnswerFields(
                  portal.form.fields,
                  values,
                  lng,
                );
                setFieldErrors(errors);
                if (Object.keys(errors).length) {
                  setError(
                    t(
                      "Vyplňte označené povinné odpovede.",
                      "Complete the highlighted required answers.",
                    ),
                  );
                  document
                    .querySelector<HTMLElement>(
                      `[data-form-field="${Object.keys(errors)[0]}"] input:not([type="file"]), [data-form-field="${Object.keys(errors)[0]}"] textarea, [data-form-field="${Object.keys(errors)[0]}"] select, [data-form-field="${Object.keys(errors)[0]}"] [role="radio"], [data-form-field="${Object.keys(errors)[0]}"] [role="button"]`,
                    )
                    ?.focus();
                } else setConfirm("submit");
              }}
            >
              {t("Odovzdať posudok", "Submit report")}
            </Button>
            <Button
              variant="ghost"
              disabled={pending || uploading}
              onClick={() => setConfirm("decline")}
            >
              {t("Odmietnuť recenzovanie", "Decline review")}
            </Button>
          </CardFooter>
        )}
      </Card>
      {confirm && !closed && (
        <ConfirmDialog
          formatError={(error) => errorText(error, lng)}
          lng={lng}
          title={
            confirm === "submit"
              ? t("Potvrdiť a odovzdať", "Confirm and submit")
              : t("Odmietnuť recenzovanie", "Decline review")
          }
          description={
            confirm === "submit"
              ? t(
                  "Odovzdanie uzamkne posudok. Opätovné otvorenie zabezpečuje koordinátor.",
                  "Submitting locks the report. A coordinator can reopen it if needed.",
                )
              : t(
                  "Osobný odkaz prestane fungovať a koordinátor bude musieť vybrať iného recenzenta.",
                  "Your private link will stop working and the coordinator will need another reviewer.",
                )
          }
          onClose={() => setConfirm(null)}
          onConfirm={async () => {
            if (confirm === "submit") await save(true);
            else {
              await mutate("decline", { token });
              setPortal({ ...portal, status: "DECLINED" });
              setValues(portal.answer?.answers || {});
              setSaved(false);
            }
          }}
        />
      )}
    </div>
  );
}
