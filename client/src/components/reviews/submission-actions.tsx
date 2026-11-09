"use client";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useFormContext } from "react-hook-form";
import { FormDialog, TextField, SelectField } from "./form-dialog";
import ReviewerPicker from "./reviewer-picker";
import { getAssignmentEligibility } from "@/lib/reviews/actions";
import {
  mutate,
  tr,
  explain,
  errorText,
  bratislavaDeadline,
} from "@/lib/reviews/ux";
import type { Assignment, Detail, Eligibility } from "@/lib/reviews/types";
import type { ConferenceReviewSettingsQuery } from "@/lib/graphql/generated/graphql";
import { label } from "@/lib/reviews/types";
import { uploadReviewFile } from "@/lib/reviews/files";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Alert, AlertDescription } from "../ui/alert";
import { ReviewField, ReviewError, reviewDate } from "../review-controls";
import { AnswerFields, validateAnswerFields } from "../answer-fields";
import ReviewerProfileView from "../reviewer-profile";
export type SubmissionAction = {
  kind: string;
  assignment?: Assignment;
  requestId?: string;
};
export function actionTitle(kind: string, lng: string) {
  const t = tr(lng);
  return (
    (
      {
        ORIGINAL: t("Nahrať nový rukopis", "Upload manuscript"),
        ADOPT: t("Prevziať odovzdaný rukopis", "Register submitted manuscript"),
        ANONYMOUS: t("Nahrať anonymizovanú kópiu", "Upload anonymous copy"),
        PREPARE: t("Potvrdiť formálnu kontrolu", "Approve preparation"),
        ASSIGN: t("Priradiť recenzenta", "Assign reviewer"),
        REPORT: t("Posudok recenzenta", "Reviewer report"),
        SEND: t("Odoslať pozvanie", "Send invitation"),
        REMIND: t("Odoslať pripomienku", "Send reminder"),
        REQUEST_REVISION: t("Vyžiadať opravu", "Request revision"),
        DECIDE: t("Uložiť rozhodnutie", "Record decision"),
        CANCEL: t("Zrušiť priradenie", "Cancel assignment"),
        REOPEN: t("Znova otvoriť posudok", "Reopen report"),
        NEXT_ROUND: t("Začať ďalšie kolo", "Start another round"),
        VERIFY_REVISION: t("Overiť opravu", "Verify revision"),
      } as Record<string, string>
    )[kind] || kind
  );
}
function AssignmentFields({
  detail,
  count,
  lng,
  sections,
  canManage,
  onCheck,
}: {
  detail: Detail;
  count: number;
  lng: string;
  sections: { value: string; label: string }[];
  canManage: boolean;
  onCheck: (value: Eligibility | null) => void;
}) {
  const t = tr(lng);
  const form = useFormContext<Record<string, string>>();
  const reviewer = form.watch("reviewerId");
  const [check, setCheck] = useState<Eligibility | null>(null);
  const [error, setError] = useState("");
  const [eligibilityRevision, setEligibilityRevision] = useState(0);
  useEffect(() => {
    let cancelled = false;
    if (reviewer)
      getAssignmentEligibility(detail.submissionId, reviewer)
        .then((result) => {
          if (!cancelled) {
            setCheck(result);
            onCheck(result);
          }
        })
        .catch((e) => {
          if (!cancelled) setError(errorText(e, lng));
        });
    return () => {
      cancelled = true;
    };
  }, [reviewer, detail.submissionId, lng, onCheck, eligibilityRevision]);
  const round = detail.rounds[0];
  const taken =
    round?.assignments.filter((a) => a.active).map((a) => a.slot) || [];
  return (
    <>
      <ReviewerPicker
        value={reviewer || ""}
        lng={lng}
        onChange={(v) => {
          onCheck(null);
          setCheck(null);
          setError("");
          form.setValue("reviewerId", v, { shouldDirty: true });
        }}
      />
      <ReviewError message={error} />
      {reviewer && !check && !error && (
        <p role="status">
          {t("Overuje sa spôsobilosť…", "Checking eligibility…")}
        </p>
      )}
      {check?.blocked && (
        <Alert variant="destructive">
          <AlertDescription>{explain(check.blocked, lng)}</AlertDescription>
        </Alert>
      )}
      {check?.warnings.map((w) => (
        <Alert key={w}>
          <AlertDescription>{explain(w, lng)}</AlertDescription>
        </Alert>
      ))}
      {check && check.warnings.length > 0 && (
        <TextField
          name="reason"
          multiline
          label={t("Zdôvodnenie výnimky", "Override reason")}
        />
      )}
      {reviewer && (
        <ReviewerProfileView
          reviewer={reviewer}
          conference={detail.conferenceId}
          submission={detail.submissionId}
          sections={sections}
          canManage={canManage}
          lng={lng}
          onEligibilityChanged={() => {
            setCheck(null);
            onCheck(null);
            setEligibilityRevision((v) => v + 1);
          }}
        />
      )}
      <SelectField
        name="slot"
        label={t("Poradie recenzenta", "Reviewer slot")}
        options={Array.from({ length: count }, (_, i) => i + 1)
          .filter((n) => !taken.includes(n))
          .map((n) => ({ value: String(n), label: String(n) }))}
      />
      <TextField
        name="deadline"
        type="date"
        label={t("Termín odovzdania", "Deadline")}
        hint={t(
          "Do 23:59 v časovom pásme Bratislava.",
          "By 23:59 in the Bratislava time zone.",
        )}
      />
    </>
  );
}
export default function SubmissionActionDialog({
  action,
  detail,
  settings,
  lng,
  sections,
  canManage,
  onClose,
  onSaved,
}: {
  action: SubmissionAction;
  detail: Detail;
  settings: ConferenceReviewSettingsQuery["conferenceReviewSettings"];
  lng: string;
  sections: { value: string; label: string }[];
  canManage: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const t = tr(lng);
  const { kind, assignment } = action;
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileError, setFileError] = useState("");
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [answers, setAnswers] = useState(assignment?.answer?.answers || {});
  const [answerErrors, setAnswerErrors] = useState<Record<string, string>>({});
  const round =
    detail.rounds.find((r) => r.id === assignment?.round) || detail.rounds[0];
  const count = round?.requiredReviews || settings?.requiredReviews || 2;
  const taken =
    round?.assignments.filter((a) => a.active).map((a) => a.slot) || [];
  const uploadKind = ["ORIGINAL", "ANONYMOUS"].includes(kind);
  const required = (value: string | undefined) => Boolean(value?.trim());
  const schema = z.record(z.string(), z.string()).superRefine((v, ctx) => {
    const fields =
      kind === "ASSIGN"
        ? [
            "reviewerId",
            "slot",
            "deadline",
            ...(eligibility?.warnings.length ? ["reason"] : []),
          ]
        : kind === "REQUEST_REVISION"
          ? ["instructions", "deadline"]
          : kind === "DECIDE"
            ? ["decision", "reason"]
            : ["CANCEL", "REOPEN"].includes(kind)
              ? ["reason"]
              : [];
    fields.forEach((key) => {
      if (!required(v[key]))
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: t("Vyplňte toto pole.", "Complete this field."),
        });
    });
    if (
      ["SEND", "REMIND"].includes(kind) &&
      assignment?.delivery === "UNKNOWN" &&
      v.acknowledged !== "yes"
    )
      ctx.addIssue({
        code: "custom",
        path: ["acknowledged"],
        message: t(
          "Potvrďte kontrolu odoslania.",
          "Confirm you checked delivery.",
        ),
      });
  });
  const readOnlyReport =
    kind === "REPORT" &&
    (assignment?.status === "SUBMITTED" ||
      !assignment?.active ||
      assignment?.round !== detail.review?.currentRound);
  const defaults = {
    reviewerId: "",
    slot: String(
      Array.from({ length: count }, (_, i) => i + 1).find(
        (n) => !taken.includes(n),
      ) || "",
    ),
    deadline: "",
    reason: "",
    instructions: "",
    notes: detail.review?.formalNotes || "",
    decision: detail.review?.decision || "PENDING",
    acknowledged: "",
  };
  async function uploadAttachment(
    f: File,
    onProgress?: (percent: number) => void,
  ) {
    return (
      await uploadReviewFile(f, {
        kind: "REPORT",
        submission: detail.submissionId,
        assignment: assignment?.id,
        onProgress: onProgress || setProgress,
      })
    ).id;
  }
  const consequences =
    kind === "NEXT_ROUND"
      ? t(
          "Začne sa nové kolo s aktuálnym dotazníkom. Pozvania odošlete samostatne.",
          "Starts a new round using the current questionnaire. Invitations are sent separately.",
        )
      : kind === "CANCEL"
        ? t(
            "Osobný odkaz prestane fungovať. História zostane zachovaná.",
            "The private link will stop working. History is preserved.",
          )
        : kind === "REOPEN"
          ? t(
              "Recenzent môže upraviť posudok. Už sprístupnená spätná väzba zostane v histórii.",
              "The reviewer can edit the report. Previously released feedback remains in history.",
            )
          : `${lng === "sk" ? detail.titleSk || detail.title : detail.title}${assignment ? ` · ${assignment.name}` : ""}`;
  return (
    <FormDialog
      lng={lng}
      title={actionTitle(kind, lng)}
      description={consequences}
      schema={schema}
      defaultValues={defaults}
      onClose={onClose}
      wide={kind === "REPORT"}
      readOnly={Boolean(readOnlyReport)}
      busy={uploading}
      disabled={
        (kind === "ASSIGN" && (!eligibility || Boolean(eligibility.blocked))) ||
        (uploadKind && !file) ||
        Boolean(readOnlyReport)
      }
      dirty={
        Boolean(file) ||
        JSON.stringify(answers) !==
          JSON.stringify(assignment?.answer?.answers || {})
      }
      submitLabel={
        kind === "REPORT"
          ? t("Zaznamenať konečný posudok", "Record final report")
          : actionTitle(kind, lng)
      }
      successMessage={
        ["SEND", "REMIND", "REQUEST_REVISION"].includes(kind)
          ? t("E-mail zaradený na odoslanie.", "Email queued.")
          : undefined
      }
      onSubmit={async (values) => {
        if (uploadKind) {
          setUploading(true);
          try {
            await uploadReviewFile(file!, {
              kind,
              submission: detail.submissionId,
              onProgress: setProgress,
            });
          } finally {
            setUploading(false);
          }
        } else if (kind === "ADOPT") {
          const response = await fetch(
            `/api/conference-review/files/adopt/${detail.submissionId}`,
            { method: "POST" },
          );
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
        } else if (kind === "REPORT") {
          const errors = validateAnswerFields(
            round.questionnaire.fields,
            answers,
            lng,
          );
          setAnswerErrors(errors);
          if (Object.keys(errors).length) {
            document
              .querySelector<HTMLElement>(
                '[data-review-field="' +
                  Object.keys(errors)[0] +
                  '"] input, [data-review-field="' +
                  Object.keys(errors)[0] +
                  '"] textarea, [data-review-field="' +
                  Object.keys(errors)[0] +
                  '"] select, [data-review-field="' +
                  Object.keys(errors)[0] +
                  '"] [role="radio"]',
              )
              ?.focus();
            throw new Error(
              t(
                "Doplňte označené odpovede.",
                "Complete the highlighted answers.",
              ),
            );
          }
          await mutate("enterReport", {
            assignment: assignment!.id,
            answers,
            expectedRevision: assignment?.answer?.revision,
          });
        } else {
          if (
            kind === "DECIDE" &&
            values.decision === "ACCEPTED" &&
            detail.blockers.ACCEPTED
          )
            throw new Error(explain(detail.blockers.ACCEPTED, lng));
          await mutate("review", {
            submission: detail.submissionId,
            action: kind,
            data: {
              ...values,
              ...(values.deadline
                ? { deadline: bratislavaDeadline(values.deadline) }
                : {}),
              ...(kind === "ASSIGN" ? { slot: Number(values.slot) } : {}),
              assignmentId: assignment?.id,
              requestId: action.requestId,
              expectedRevision: detail.review?.revision,
            },
          });
        }
        await onSaved();
      }}
    >
      {(form) => (
        <>
          <ReviewError message={fileError} />
          {uploadKind && (
            <ReviewField
              label={t("Súbor rukopisu", "Manuscript file")}
              hint={t(
                "DOCX alebo PDF, najviac 20 MiB. Nahrávanie sa spustí po potvrdení.",
                "DOCX or PDF, maximum 20 MiB. Upload starts after confirmation.",
              )}
            >
              {(id) => (
                <>
                  <Input
                    id={id}
                    type="file"
                    accept=".docx,.pdf"
                    disabled={uploading}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  {file && (
                    <p>
                      {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MiB
                    </p>
                  )}
                  {uploading && (
                    <p role="status">
                      {t("Nahráva sa", "Uploading")} {progress}%
                    </p>
                  )}
                </>
              )}
            </ReviewField>
          )}
          {kind === "PREPARE" && (
            <>
              <Alert>
                <AlertDescription>
                  {detail.requirements ||
                    t(
                      "Skontrolujte formálne požiadavky a odstránenie identity autorov z anonymizovanej kópie.",
                      "Check manuscript requirements and removal of author identities from the anonymous copy.",
                    )}
                </AlertDescription>
              </Alert>
              <TextField
                name="notes"
                multiline
                label={t("Poznámky z kontroly", "Preparation notes")}
              />
            </>
          )}
          {kind === "ASSIGN" && (
            <AssignmentFields
              detail={detail}
              count={count}
              lng={lng}
              sections={sections}
              canManage={canManage}
              onCheck={setEligibility}
            />
          )}
          {["SEND", "REMIND"].includes(kind) && assignment && (
            <>
              <p>
                {assignment.email} · {reviewDate(assignment.deadline, lng)}
              </p>
              <p className="whitespace-pre-line">{settings?.instructions}</p>
              <p>
                {t(
                  "Príloha: schválený anonymizovaný rukopis a osobný odkaz na dotazník.",
                  "Attachment: approved anonymous manuscript and a private questionnaire link.",
                )}
              </p>
              <p className="whitespace-pre-line">{settings?.signature}</p>
              {assignment.delivery === "UNKNOWN" && (
                <ReviewField
                  label={t(
                    "Overil/a som odoslanie a súhlasím s opätovným odoslaním, ktoré môže vytvoriť duplicitný e-mail.",
                    "I checked delivery and accept that resending may duplicate the email.",
                  )}
                >
                  {(id) => (
                    <Checkbox
                      id={id}
                      checked={form.watch("acknowledged") === "yes"}
                      onCheckedChange={(v) =>
                        form.setValue("acknowledged", v ? "yes" : "", {
                          shouldDirty: true,
                        })
                      }
                    />
                  )}
                </ReviewField>
              )}
            </>
          )}
          {["CANCEL", "REOPEN", "DECIDE"].includes(kind) && (
            <TextField
              name="reason"
              multiline
              label={t("Zdôvodnenie", "Reason")}
            />
          )}
          {kind === "REQUEST_REVISION" && (
            <>
              <TextField
                name="instructions"
                multiline
                label={t("Pokyny pre autora", "Instructions for the author")}
              />
              <TextField
                name="deadline"
                type="date"
                label={t("Termín opravy", "Revision deadline")}
              />
            </>
          )}
          {kind === "DECIDE" && (
            <>
              <SelectField
                name="decision"
                label={t("Rozhodnutie", "Decision")}
                options={["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"].map(
                  (value) => ({
                    value,
                    label:
                      value === "PENDING"
                        ? t("Znova otvoriť konanie", "Reopen review process")
                        : label(value, lng),
                  }),
                )}
              />
              {form.watch("decision") === "ACCEPTED" &&
                detail.blockers.ACCEPTED && (
                  <Alert>
                    <AlertDescription>
                      {explain(detail.blockers.ACCEPTED, lng)}
                    </AlertDescription>
                  </Alert>
                )}
              <Alert>
                <AlertDescription>
                  {t(
                    "Rozhodnutie sa odošle autorovi. Uzavretie zruší osobné odkazy a otvorené výzvy na opravu. Opätovné otvorenie odkazy neobnoví.",
                    "The author is notified. Closing revokes private links and open revision requests. Reopening does not restore those links.",
                  )}
                </AlertDescription>
              </Alert>
            </>
          )}
          {kind === "REPORT" && assignment && (
            <>
              {readOnlyReport && (
                <p>
                  {t(
                    "Tento posudok je iba na čítanie.",
                    "This report is read-only.",
                  )}
                </p>
              )}
              {assignment.attachments?.map((f) => (
                <a
                  key={f.id}
                  className="underline"
                  href={`/api/conference-review/files/${f.id}`}
                >
                  {f.filename}
                </a>
              ))}
              {!readOnlyReport && (
                <ReviewField
                  label={t(
                    "Originál doručeného posudku (voliteľné)",
                    "Received report file (optional)",
                  )}
                >
                  {(id) => (
                    <Input
                      id={id}
                      type="file"
                      accept=".pdf,.docx"
                      disabled={uploading}
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setUploading(true);
                          try {
                            setFileError("");
                            await uploadAttachment(f);
                          } catch (e) {
                            setFileError(errorText(e, lng));
                          } finally {
                            setUploading(false);
                          }
                        }
                      }}
                    />
                  )}
                </ReviewField>
              )}
              <AnswerFields
                fields={round.questionnaire.fields}
                values={answers}
                onChange={(id, value) =>
                  setAnswers((current) => ({ ...current, [id]: value }))
                }
                disabled={Boolean(readOnlyReport)}
                upload={uploadAttachment}
                onUploadingChange={setUploading}
                lng={lng}
                errors={answerErrors}
              />
              {uploading && (
                <p role="status">
                  {t("Nahráva sa", "Uploading")} {progress}%
                </p>
              )}
            </>
          )}
        </>
      )}
    </FormDialog>
  );
}
