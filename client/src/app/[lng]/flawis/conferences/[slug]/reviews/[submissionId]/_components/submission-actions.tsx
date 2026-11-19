"use client";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useFormContext } from "react-hook-form";
import {
  FormDialog,
  TextField,
  SelectField,
} from "@/components/form/form-dialog";
import ReviewerPicker from "@/app/[lng]/flawis/conferences/[slug]/reviews/[submissionId]/_components/reviewer-picker";
import { getAssignmentEligibility } from "@/lib/reviews/actions";
import {
  mutate,
  explain,
  errorText,
  bratislavaDeadline,
} from "@/lib/reviews/ux";
import { localizedText as tr } from "@/lib/i18n/text";
import type { Assignment, Detail, Eligibility } from "@/lib/reviews/types";
import type { ConferenceReviewSettingsQuery } from "@/lib/graphql/generated/graphql";
import { label, bpfConditionsId, reportFields } from "@/lib/reviews/types";
import { uploadReviewFile } from "@/lib/reviews/files";
import { toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FieldControl, ErrorAlert } from "@/components/form/field-controls";
import { formatDate } from "@/lib/date";
import {
  AnswerFields,
  validateAnswerFields,
} from "@/components/form/answer-fields";
import ReviewerProfileView from "@/app/[lng]/flawis/reviewers/_components/reviewer-profile";

export type SubmissionAction = {
  kind: string;
  assignment?: Assignment;
  requestId?: string;
  parentRequest?: string;
};

export function actionTitle(kind: string, lng: string) {
  const t = tr(lng);
  return (
    (
      {
        SET_PARTICIPATION: t(
          "Potvrdiť aktívnu účasť autora",
          "Confirm author participation",
        ),
        ORIGINAL: t("Nahrať nový rukopis", "Upload manuscript"),
        FINAL: t("Nahrať finálny rukopis", "Upload final manuscript"),
        PROOF_PDF: t("Nahrať PDF korektúry", "Upload proof PDF"),
        REQUEST_PROOF: t("Odoslať autorskú korektúru", "Send author proof"),
        NO_PROOF_RESPONSE: t("Uzavrieť bez odpovede", "Close without response"),
        RECORD_PROOF_APPROVAL: t(
          "Zaznamenať súhlas autora",
          "Record author approval",
        ),
        APPROVE_PUBLICATION: t(
          "Schváliť vydavateľský balík",
          "Approve publication package",
        ),
        DELIVER_PUBLICATION: t(
          "Potvrdiť odovzdanie redakcii",
          "Confirm editorial delivery",
        ),
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
        REVOKE_CHECK: t("Zrušiť kontrolu", "Revoke reviewer check"),
        REQUEST_REVIEWER_CHECK: t(
          "Vyžiadať kontrolu recenzentom",
          "Request reviewer check",
        ),
        DRAFT_ANONYMOUS: t(
          "Vytvoriť návrh anonymizácie",
          "Generate anonymous draft",
        ),
        STAFF_RECEIPT: t("Zaevidovať súbory autora", "Record author files"),
        CLOSE_REPORT: t("Uzavrieť posudok", "Close report"),
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
      <ErrorAlert message={error} />
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
  const [tracked, setTracked] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileError, setFileError] = useState("");
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [answers, setAnswers] = useState(assignment?.answer?.answers || {});
  const [answerErrors, setAnswerErrors] = useState<Record<string, string>>({});
  const round =
    detail.rounds.find((r) => r.id === assignment?.round) || detail.rounds[0];
  const request = detail.revisions.find(
    (r) => r.id === (action.requestId || action.parentRequest),
  );
  const bpf = (round?.questionnaire || settings?.questionnaire)?.fields.some(
    (f) => f.id === bpfConditionsId,
  );
  const fields = round
    ? reportFields(
        round.questionnaire.fields,
        round.recommendationField,
        answers,
      )
    : [];
  const count = round?.requiredReviews || settings?.requiredReviews || 2;
  const taken =
    round?.assignments.filter((a) => a.active).map((a) => a.slot) || [];
  const uploadKind = [
    "ORIGINAL",
    "ANONYMOUS",
    "FINAL",
    "PROOF_PDF",
    "STAFF_RECEIPT",
  ].includes(kind);
  const acceptedFiles =
    kind === "PROOF_PDF"
      ? ".pdf"
      : kind === "FINAL" ||
          kind === "STAFF_RECEIPT" ||
          (kind === "ORIGINAL" && detail.versions[0]?.template)
        ? ".docx"
        : ".docx,.pdf";
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
          ? [
              ...(!action.parentRequest &&
              !Object.entries(v).some(
                ([key, value]) => key.startsWith("report-") && value.trim(),
              )
                ? ["instructions"]
                : []),
              "deadline",
            ]
          : kind === "DECIDE"
            ? ["decision", "reason"]
            : ["CANCEL", "REOPEN", "RECORD_PROOF_APPROVAL"].includes(kind)
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
    participation: detail.review?.participationConfirmed ? "yes" : "no",
    reviewerId: "",
    slot: String(
      Array.from({ length: count }, (_, i) => i + 1).find(
        (n) => !taken.includes(n),
      ) || "",
    ),
    deadline: "",
    reason: "",
    instructions: action.parentRequest
      ? request?.points
          ?.filter((p) => p.status === "NEEDS_CHANGES")
          .map((p) => p.text)
          .join("\n\n") || ""
      : "",
    ...Object.fromEntries(
      Object.entries(detail.versions[0]?.formalChecks || {}).map(([k, v]) => [
        k,
        String(v),
      ]),
    ),
    ...Object.fromEntries(
      (request?.points || [])
        .filter((p) => p.status !== "PENDING")
        .map((p) => ["check-" + p.id, p.status]),
    ),
    ...Object.fromEntries(
      (round?.assignments || []).map((a) => [
        "report-" + a.id,
        String(a.answer?.answers[bpfConditionsId] || ""),
      ]),
    ),
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
      formatError={(error) => errorText(error, lng)}
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
        (uploadKind &&
          (!file ||
            (kind === "STAFF_RECEIPT" &&
              request?.kind === "POST_REVIEW" &&
              !tracked))) ||
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
              sourceVersion: detail.review?.currentVersion || undefined,
              kind: kind === "STAFF_RECEIPT" ? "REVISION" : kind,
              tracked: tracked || undefined,
              requestId: action.requestId,
              submission: detail.submissionId,
              onProgress: setProgress,
            });
          } finally {
            setUploading(false);
          }
        } else if (
          ["APPROVE_PUBLICATION", "DELIVER_PUBLICATION"].includes(kind)
        ) {
          const response = await fetch(
            "/api/conference-review/exports/" + detail.submissionId,
            {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                action: kind,
                expectedRevision: detail.review?.revision,
                publication: detail.review?.publication,
              }),
            },
          );
          if (!response.ok) throw new Error((await response.json()).error);
        } else if (kind === "DRAFT_ANONYMOUS") {
          const response = await fetch(
            "/api/conference-review/files/draft/" +
              detail.submissionId +
              "?version=" +
              detail.review?.currentVersion,
            { method: "POST" },
          );
          const draft = await response.json();
          if (!response.ok) throw new Error(draft.error);

          if (draft.warnings?.length)
            toast.add({
              type: "warning",
              title: t(
                "Skontrolujte anonymizáciu rukopisu",
                "Check the anonymous manuscript",
              ),
              description: draft.warnings.join(" "),
              timeout: 0,
            });
        } else if (kind === "ADOPT") {
          const response = await fetch(
            `/api/conference-review/files/adopt/${detail.submissionId}`,
            { method: "POST" },
          );
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
        } else if (kind === "REPORT") {
          const errors = validateAnswerFields(fields, answers, lng);
          setAnswerErrors(errors);

          if (Object.keys(errors).length) {
            document
              .querySelector<HTMLElement>(
                '[data-form-field="' +
                  Object.keys(errors)[0] +
                  '"] input, [data-form-field="' +
                  Object.keys(errors)[0] +
                  '"] textarea, [data-form-field="' +
                  Object.keys(errors)[0] +
                  '"] select, [data-form-field="' +
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
              parentRequest: action.parentRequest,
              reportPoints: Object.fromEntries(
                (round?.assignments || []).map((a) => [
                  a.id,
                  values["report-" + a.id] || "",
                ]),
              ),
              ...(kind === "REQUEST_REVIEWER_CHECK"
                ? {
                    pointIds: (request?.points || [])
                      .filter(
                        (p) =>
                          p.status !== "VERIFIED" &&
                          (!p.assignment ||
                            p.assignment === values.checkAssignment) &&
                          values["point-" + p.id] !== "no",
                      )
                      .map((p) => p.id),
                  }
                : {}),
              checks: Object.fromEntries(
                (request?.points || []).map((p) => [
                  p.id,
                  values["check-" + p.id],
                ]),
              ),
              expectedRevision: detail.review?.revision,
            },
          });
        }

        await onSaved();
      }}
    >
      {(form) => (
        <>
          <ErrorAlert message={fileError} />
          {uploadKind && (
            <FieldControl
              label={t("Súbor rukopisu", "Manuscript file")}
              hint={
                acceptedFiles
                  .toUpperCase()
                  .replaceAll(".", "")
                  .replace(",", " / ") +
                " · " +
                t("Najviac 20 MiB.", "Maximum 20 MiB.")
              }
            >
              {(id) => (
                <>
                  <Input
                    id={id}
                    type="file"
                    accept={acceptedFiles}
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
            </FieldControl>
          )}
          {bpf && ["PREPARE", "VERIFY_REVISION"].includes(kind) && (
            <>
              <TextField
                name="language"
                label={t("Jazyk rukopisu (EN)", "Manuscript language (EN)")}
              />
              <TextField
                name="pageSize"
                label={t("Formát strany (B5)", "Page format (B5)")}
              />
              <TextField
                name="abstractWords"
                type="number"
                label={t(
                  "Počet slov anglického abstraktu",
                  "English abstract word count",
                )}
              />
              <TextField
                name="keywordCount"
                type="number"
                label={t("Počet kľúčových slov", "Keyword count")}
              />
              {["bibliography", "contacts"].map((name) => (
                <SelectField
                  key={name}
                  name={name}
                  label={
                    name === "bibliography"
                      ? t("Bibliografia", "Bibliography")
                      : t("Kontakty autora", "Author contact details")
                  }
                  options={[
                    { value: "yes", label: t("Overené", "Checked") },
                    { value: "no", label: t("Chýba", "Missing") },
                  ]}
                />
              ))}
            </>
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
                {assignment.email} · {formatDate(assignment.deadline, lng)}
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
                <FieldControl
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
                </FieldControl>
              )}
            </>
          )}
          {["CANCEL", "REOPEN", "DECIDE", "RECORD_PROOF_APPROVAL"].includes(
            kind,
          ) && (
            <TextField
              name="reason"
              multiline
              label={t("Zdôvodnenie", "Reason")}
            />
          )}
          {kind === "SET_PARTICIPATION" && (
            <SelectField
              name="participation"
              label={t(
                "Aktívna účasť autora na konferencii",
                "Author participated in the conference",
              )}
              options={[
                { value: "no", label: t("Nepotvrdená", "Unconfirmed") },
                { value: "yes", label: t("Potvrdená", "Confirmed") },
              ]}
            />
          )}
          {kind === "VERIFY_REVISION" &&
            request?.points?.map((p) => (
              <div key={p.id}>
                <p>
                  {p.authorStatus &&
                    (p.authorStatus === "addressed"
                      ? t("Zapracované", "Addressed")
                      : t("Nezapracované", "Not addressed"))}{" "}
                  {p.response} {p.location}
                </p>
                <SelectField
                  name={"check-" + p.id}
                  label={p.text}
                  options={[
                    { value: "VERIFIED", label: t("Overené", "Verified") },
                    {
                      value: "NEEDS_CHANGES",
                      label: t("Vyžaduje opravu", "Needs changes"),
                    },
                  ]}
                />
              </div>
            ))}
          {((kind === "STAFF_RECEIPT" && request?.kind === "POST_REVIEW") ||
            (kind === "ANONYMOUS" && detail.versions[0]?.trackedFile)) && (
            <FieldControl
              label={t(
                "Rukopis so sledovanými zmenami",
                "Manuscript with tracked changes",
              )}
            >
              {(id) => (
                <Input
                  id={id}
                  type="file"
                  accept=".docx"
                  disabled={uploading}
                  onChange={(e) => setTracked(e.target.files?.[0] || null)}
                />
              )}
            </FieldControl>
          )}
          {kind === "REQUEST_REVIEWER_CHECK" && (
            <>
              <SelectField
                name="checkAssignment"
                label={t("Pôvodný recenzent", "Original reviewer")}
                options={(round?.assignments || [])
                  .filter((a) => a.active && a.status === "SUBMITTED")
                  .map((a) => ({ value: a.id, label: a.name }))}
              />
              {form.watch("checkAssignment") &&
                request?.points
                  ?.filter(
                    (p) =>
                      p.status !== "VERIFIED" &&
                      (!p.assignment ||
                        p.assignment === form.watch("checkAssignment")),
                  )
                  .map((p) => (
                    <FieldControl key={p.id} label={p.text}>
                      {(id) => (
                        <Checkbox
                          id={id}
                          checked={form.watch("point-" + p.id) !== "no"}
                          onCheckedChange={(checked) =>
                            form.setValue(
                              "point-" + p.id,
                              checked ? "yes" : "no",
                              { shouldDirty: true },
                            )
                          }
                        />
                      )}
                    </FieldControl>
                  ))}
            </>
          )}
          {["REQUEST_PROOF", "REQUEST_REVIEWER_CHECK"].includes(kind) && (
            <TextField
              name="deadline"
              type="date"
              label={t("Termín korektúry", "Proof deadline")}
            />
          )}
          {kind === "REQUEST_REVISION" && (
            <>
              <TextField
                name="instructions"
                multiline
                label={t(
                  "Pokyny pre autora (body oddeľte prázdnym riadkom)",
                  "Instructions for the author (separate points with a blank line)",
                )}
              />
              {!action.parentRequest &&
                round?.assignments
                  .filter((a) => a.active && a.status === "SUBMITTED")
                  .map((a) => (
                    <TextField
                      key={a.id}
                      name={"report-" + a.id}
                      multiline
                      label={
                        t("Podmienky z posudku", "Conditions from report") +
                        " " +
                        a.slot
                      }
                    />
                  ))}
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
                <FieldControl
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
                </FieldControl>
              )}
              <AnswerFields
                fields={fields}
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
