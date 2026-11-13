"use client";
import { useState } from "react";
import { z } from "zod";
import { getReviewerProfile } from "@/lib/reviews/actions";
import { mutate, errorText } from "@/lib/reviews/ux";
import { localizedText as tr } from "@/lib/i18n/text";
import type { ReviewerProfile } from "@/lib/reviews/types";
import { label } from "@/lib/reviews/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldSet, FieldLegend } from "@/components/ui/field";
import { ErrorAlert, FieldControl } from "@/components/form/field-controls";
import { formatDate } from "@/lib/date";
import { FormDialog, ViewDialog } from "@/components/form/form-dialog";
export default function ReviewerProfileView({
  reviewer,
  conference,
  submission,
  sections = [],
  canManage = false,
  lng,
  onEligibilityChanged,
}: {
  reviewer: string;
  conference?: string;
  submission?: string;
  sections?: { value: string; label: string }[];
  canManage?: boolean;
  lng: string;
  onEligibilityChanged?: () => void;
}) {
  const t = tr(lng);
  const [profile, setProfile] = useState<ReviewerProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function load() {
    setPending(true);
    setError("");
    try {
      setProfile(await getReviewerProfile(reviewer, conference));
    } catch (e) {
      setError(errorText(e, lng));
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      {!profile && <ErrorAlert message={error} />}
      <Button variant="ghost" disabled={pending} onClick={load}>
        {pending
          ? t("Načítava sa…", "Loading…")
          : t("Spôsobilosť a história", "Eligibility and history")}
      </Button>
      {profile && !editing && (
        <ViewDialog
          title={t(
            "Spôsobilosť a história recenzenta",
            "Reviewer eligibility and history",
          )}
          lng={lng}
          onClose={() => setProfile(null)}
        >
          <div className="flex flex-col gap-4">
            <ErrorAlert message={error} />
            <p className="text-sm text-muted-foreground">
              {t(
                "Zobrazujú sa len príspevky, ku ktorým máte prístup.",
                "Only submissions you are authorized to access are shown.",
              )}
            </p>
            {conference && (
              <>
                {sections
                  .filter(
                    (s) =>
                      profile.eligibility.participatedSections.includes(
                        s.value,
                      ) ||
                      profile.eligibility.guarantorSections.includes(s.value),
                  )
                  .map((s) => (
                    <p key={s.value}>
                      {s.label} ·{" "}
                      {profile.eligibility.guarantorSections.includes(s.value)
                        ? t("Garant", "Guarantor")
                        : t("Účastník", "Participant")}
                    </p>
                  ))}
                {submission &&
                  profile.eligibility.conflicts.includes(submission) && (
                    <p>
                      {t(
                        "Deklarovaný konflikt pri tomto príspevku",
                        "Declared conflict for this submission",
                      )}
                    </p>
                  )}
                {canManage && (
                  <Button variant="outline" onClick={() => setEditing(true)}>
                    {t("Upraviť spôsobilosť", "Edit eligibility")}
                  </Button>
                )}
              </>
            )}
            {profile.history.length ? (
              profile.history.map((item) => (
                <div key={item.id} className="flex flex-col gap-1">
                  <p className="font-medium">{item.title}</p>
                  <p>
                    {label(item.status, lng)} · {formatDate(item.deadline, lng)}
                    {!item.active ? ` · ${t("Archív", "Archived")}` : ""}
                  </p>
                </div>
              ))
            ) : (
              <p>{t("Zatiaľ žiadne priradenia.", "No assignments yet.")}</p>
            )}
            {profile.hasNextPage && (
              <Button
                variant="outline"
                disabled={pending}
                onClick={async () => {
                  setPending(true);
                  try {
                    const next = await getReviewerProfile(
                      reviewer,
                      conference,
                      profile.endCursor || undefined,
                    );
                    setProfile({
                      ...next,
                      history: [...profile.history, ...next.history],
                    });
                  } catch (e) {
                    setError(errorText(e, lng));
                  } finally {
                    setPending(false);
                  }
                }}
              >
                {t("Staršie priradenia", "Older assignments")}
              </Button>
            )}
          </div>
        </ViewDialog>
      )}
      {profile && editing && (
        <FormDialog
          formatError={(error) => errorText(error, lng)}
          lng={lng}
          title={t("Spôsobilosť recenzenta", "Reviewer eligibility")}
          schema={z.object({
            participatedSections: z.array(z.string()),
            guarantorSections: z.array(z.string()),
            conflicts: z.array(z.string()),
          })}
          defaultValues={profile.eligibility}
          onClose={() => setEditing(false)}
          onSubmit={async (data) => {
            await mutate("eligibility", { conference, reviewer, data });
            setProfile({ ...profile, eligibility: data });
            onEligibilityChanged?.();
          }}
        >
          {(form) => (
            <>
              {sections.map((section) => (
                <FieldSet key={section.value}>
                  <FieldLegend>{section.label}</FieldLegend>
                  {(["participatedSections", "guarantorSections"] as const).map(
                    (key) => (
                      <FieldControl
                        key={key}
                        label={
                          key === "participatedSections"
                            ? t("Účasť v sekcii", "Participated in section")
                            : t("Garant sekcie", "Section guarantor")
                        }
                      >
                        {(id) => (
                          <Checkbox
                            id={id}
                            checked={form.watch(key).includes(section.value)}
                            onCheckedChange={(checked) =>
                              form.setValue(
                                key,
                                checked
                                  ? [...form.getValues(key), section.value]
                                  : form
                                      .getValues(key)
                                      .filter((v) => v !== section.value),
                                { shouldDirty: true },
                              )
                            }
                          />
                        )}
                      </FieldControl>
                    ),
                  )}
                </FieldSet>
              ))}
              {submission && (
                <FieldControl
                  label={t(
                    "Konflikt pri tomto príspevku",
                    "Conflict for this submission",
                  )}
                >
                  {(id) => (
                    <Checkbox
                      id={id}
                      checked={form.watch("conflicts").includes(submission)}
                      onCheckedChange={(checked) =>
                        form.setValue(
                          "conflicts",
                          checked
                            ? [...form.getValues("conflicts"), submission]
                            : form
                                .getValues("conflicts")
                                .filter((v) => v !== submission),
                          { shouldDirty: true },
                        )
                      }
                    />
                  )}
                </FieldControl>
              )}
            </>
          )}
        </FormDialog>
      )}
    </>
  );
}
