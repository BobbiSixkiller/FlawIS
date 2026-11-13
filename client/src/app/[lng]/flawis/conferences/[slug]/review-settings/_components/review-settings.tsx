"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useFormContext } from "react-hook-form";
import { getFormVersions } from "@/lib/reviews/actions";
import { mutate, errorText } from "@/lib/reviews/ux";
import { localizedText as tr } from "@/lib/i18n/text";
import { uploadReviewFile } from "@/lib/reviews/files";
import {
  FieldType,
  type ConferenceReviewSettingsQuery,
  type FormFragment,
  type FormLibraryQuery,
} from "@/lib/graphql/generated/graphql";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  FieldControl,
  SelectControl,
  ErrorAlert,
} from "@/components/form/field-controls";
import {
  FormDialog,
  TextField,
  SelectField,
  ConfirmDialog,
} from "@/components/form/form-dialog";
type Config = {
  enabled: boolean;
  requiredReviews: string;
  instructions: string;
  signature: string;
  replyTo: string;
  remindersEnabled: boolean;
  sectionRequirements: Record<string, string>;
  form: string;
  recommendationField: string;
  authorFields: string[];
  templateFile: string;
};
type Settings = ConferenceReviewSettingsQuery["conferenceReviewSettings"];
const compatible = (f: FormFragment["fields"][number]) =>
  f.required &&
  [FieldType.Select, FieldType.RadioGroup].includes(f.type) &&
  ["PUBLISH", "CONDITIONAL", "REJECT"].every((v) =>
    f.selectOptions?.some((o) => o.value === v),
  );
const groups = [
  "workflow",
  "requirements",
  "communication",
  "questionnaire",
] as const;
type Group = (typeof groups)[number];
export default function ReviewSettings({
  conference,
  settings,
  forms,
  sections,
  grants,
  isAdmin,
  lng,
}: {
  conference: string;
  settings: Settings;
  forms: FormLibraryQuery["formLibrary"];
  sections: { value: string; label: string }[];
  grants: { id: string; person: string; section: string | null }[];
  isAdmin: boolean;
  lng: string;
}) {
  const t = tr(lng);
  const router = useRouter();
  const [editing, setEditing] = useState<Group | null>(null);
  const [grant, setGrant] = useState(false);
  const [revoke, setRevoke] = useState<(typeof grants)[number] | null>(null);
  const titles = {
    workflow: t("Priebeh recenzovania", "Review workflow"),
    requirements: t("Požiadavky sekcií", "Section requirements"),
    communication: t("Komunikácia", "Communication"),
    questionnaire: t("Dotazník a šablóna", "Questionnaire and template"),
  };
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold">
        {t("Nastavenia recenzovania", "Review settings")}
      </h1>
      <Alert>
        <AlertDescription>
          {t(
            "Počet recenzentov, dotazník a šablóna sa použijú pre nové kolá. Existujúce kolá si ponechajú pôvodné nastavenia.",
            "Reviewer count, questionnaire and template apply to new rounds. Existing rounds retain their original settings.",
          )}
        </AlertDescription>
      </Alert>
      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((group) => (
          <Card key={group}>
            <CardHeader>
              <CardTitle>{titles[group]}</CardTitle>
            </CardHeader>
            <CardContent>
              {group === "workflow" ? (
                <div className="flex flex-col gap-2">
                  <Badge variant={settings?.enabled ? "secondary" : "outline"}>
                    {settings?.enabled
                      ? t("Recenzovanie povolené", "Reviews enabled")
                      : t("Recenzovanie vypnuté", "Reviews disabled")}
                  </Badge>
                  <p>
                    {settings?.requiredReviews || 2}{" "}
                    {t("požadovaných posudkov", "required reports")}
                  </p>
                </div>
              ) : group === "requirements" ? (
                <p>
                  {
                    Object.values(settings?.sectionRequirements || {}).filter(
                      Boolean,
                    ).length
                  }
                  /{sections.length}{" "}
                  {t(
                    "sekcií má zadané požiadavky",
                    "sections have manuscript requirements",
                  )}
                </p>
              ) : group === "communication" ? (
                <div className="flex flex-col gap-2">
                  <p>
                    {settings?.replyTo ||
                      t(
                        "Adresa pre odpovede nie je nastavená",
                        "No reply-to address set",
                      )}
                  </p>
                  <p>
                    {settings?.remindersEnabled
                      ? t(
                          "Automatické pripomienky zapnuté",
                          "Automatic reminders enabled",
                        )
                      : t(
                          "Automatické pripomienky vypnuté",
                          "Automatic reminders disabled",
                        )}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p>
                    {settings?.questionnaire
                      ? `${forms.find((f) => f.id === settings.questionnaire?.definition)?.name || t("Dotazník", "Questionnaire")} · v${settings.questionnaire.version}`
                      : t(
                          "Pri zapnutí sa vytvorí základný dotazník",
                          "A baseline questionnaire is created on activation",
                        )}
                  </p>
                  <p>
                    {settings?.templateFile
                      ? t("Vlastná DOCX šablóna", "Custom DOCX template")
                      : t("Základná DOCX šablóna", "Baseline DOCX template")}
                  </p>
                  {settings?.templateFile && (
                    <a
                      className="underline"
                      href={`/api/conference-review/files/${settings.templateFile}`}
                    >
                      {t(
                        "Stiahnuť aktuálnu šablónu",
                        "Download current template",
                      )}
                    </a>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                aria-label={`${t("Upraviť", "Edit")} ${titles[group]}`}
                onClick={() => setEditing(group)}
              >
                {t("Upraviť", "Edit")}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("Koordinátori", "Coordinators")}</CardTitle>
          <CardDescription>
            {t(
              "Konferenčných koordinátorov menuje administrátor; sekčných môže menovať aj koordinátor konferencie.",
              "Administrators appoint conference coordinators; conference coordinators may appoint section coordinators.",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {grants.map((g) => (
            <div key={g.id} className="flex items-center justify-between gap-2">
              <p>
                {g.person} ·{" "}
                {sections.find((s) => s.value === g.section)?.label ||
                  t("Celá konferencia", "Whole conference")}
              </p>
              {(g.section || isAdmin) && (
                <Button variant="ghost" onClick={() => setRevoke(g)}>
                  {t("Odobrať", "Remove")}
                </Button>
              )}
            </div>
          ))}
          {!grants.length && (
            <p>{t("Zatiaľ žiadni koordinátori.", "No coordinators yet.")}</p>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => setGrant(true)}>
            {t("Pridať koordinátora", "Add coordinator")}
          </Button>
        </CardFooter>
      </Card>
      {editing && (
        <SettingsDialog
          key={`${editing}:${settings?.id}`}
          group={editing}
          title={titles[editing]}
          conference={conference}
          settings={settings}
          forms={forms}
          sections={sections}
          lng={lng}
          onClose={() => setEditing(null)}
          onSaved={() => router.refresh()}
        />
      )}
      {grant && (
        <FormDialog
          formatError={(error) => errorText(error, lng)}
          title={t("Pridať koordinátora", "Add coordinator")}
          description={t(
            "Zadajte e-mail existujúceho overeného účtu FlawIS.",
            "Enter the email of an existing verified FlawIS account.",
          )}
          lng={lng}
          defaultValues={{ email: "", section: "" }}
          schema={z.object({
            email: z.email(t("Zadajte platný e-mail.", "Enter a valid email.")),
            section: isAdmin
              ? z.string()
              : z.string().min(1, t("Vyberte sekciu.", "Choose a section.")),
          })}
          onClose={() => setGrant(false)}
          onSubmit={async (data) => {
            await mutate("grant", {
              conference,
              email: data.email,
              section: data.section || undefined,
            });
            router.refresh();
          }}
        >
          {() => (
            <>
              <TextField name="email" type="email" label="E-mail" />
              <SelectField
                name="section"
                label={t("Rozsah oprávnení", "Access scope")}
                empty={
                  isAdmin
                    ? t("Celá konferencia", "Whole conference")
                    : t("Vyberte sekciu", "Choose a section")
                }
                options={sections}
              />
            </>
          )}
        </FormDialog>
      )}
      {revoke && (
        <ConfirmDialog
          formatError={(error) => errorText(error, lng)}
          title={t("Odobrať koordinátora", "Remove coordinator")}
          description={`${revoke.person}. ${t("Používateľ stratí toto oprávnenie. História zostane zachovaná.", "The user loses this access grant. History is preserved.")}`}
          lng={lng}
          onClose={() => setRevoke(null)}
          onConfirm={async () => {
            await mutate("revoke", { id: revoke.id });
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
function SettingsDialog({
  group,
  title,
  settings,
  conference,
  forms,
  sections,
  lng,
  onClose,
  onSaved,
}: {
  group: Group;
  title: string;
  settings: Settings;
  conference: string;
  forms: FormLibraryQuery["formLibrary"];
  sections: { value: string; label: string }[];
  lng: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = tr(lng);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingQuestionnaire, setLoadingQuestionnaire] = useState(false);
  const [progress, setProgress] = useState(0);
  const defaults: Config = {
    enabled: settings?.enabled || false,
    requiredReviews: String(settings?.requiredReviews || 2),
    instructions: settings?.instructions || "",
    signature: settings?.signature || "",
    replyTo: settings?.replyTo || "",
    remindersEnabled: settings?.remindersEnabled || false,
    sectionRequirements: (settings?.sectionRequirements || {}) as Record<
      string,
      string
    >,
    form: settings?.form || "",
    recommendationField: settings?.recommendationField || "",
    authorFields: settings?.authorFields || [],
    templateFile: settings?.templateFile || "",
  };
  const schema = z.object({
    enabled: z.boolean(),
    requiredReviews: z
      .string()
      .refine(
        (v) => Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 10,
        t("Zadajte počet od 1 do 10.", "Enter a count from 1 to 10."),
      ),
    instructions: z.string(),
    signature: z.string(),
    replyTo: z.union([
      z.literal(""),
      z.email(t("Zadajte platný e-mail.", "Enter a valid email.")),
    ]),
    remindersEnabled: z.boolean(),
    sectionRequirements: z.record(z.string(), z.string()),
    form: z.string(),
    recommendationField: z.string(),
    authorFields: z.array(z.string()),
    templateFile: z.string(),
  });
  return (
    <FormDialog
      formatError={(error) => errorText(error, lng)}
      lng={lng}
      title={title}
      schema={schema}
      defaultValues={defaults}
      onClose={onClose}
      busy={uploading}
      disabled={loadingQuestionnaire}
      dirty={Boolean(file)}
      onSubmit={async (values) => {
        let data: Record<string, unknown>;
        if (group === "workflow")
          data = {
            enabled: values.enabled,
            requiredReviews: Number(values.requiredReviews),
          };
        else if (group === "requirements")
          data = { sectionRequirements: values.sectionRequirements };
        else if (group === "communication")
          data = {
            instructions: values.instructions,
            signature: values.signature,
            replyTo: values.replyTo,
            remindersEnabled: values.remindersEnabled,
          };
        else {
          let templateFile = values.templateFile;
          if (file) {
            setUploading(true);
            try {
              templateFile = (
                await uploadReviewFile(file, {
                  kind: "TEMPLATE",
                  conference,
                  onProgress: setProgress,
                })
              ).id;
            } finally {
              setUploading(false);
            }
          }
          data = {
            form: values.form || undefined,
            recommendationField: values.recommendationField,
            authorFields: values.authorFields,
            templateFile: templateFile || undefined,
          };
          if (values.form && !values.recommendationField)
            throw new Error(
              t(
                "Vyberte kompatibilnú otázku s celkovým odporúčaním.",
                "Select a compatible overall recommendation question.",
              ),
            );
        }
        await mutate("settings", { conference, data });
        onSaved();
      }}
    >
      {(form) => (
        <>
          {group === "workflow" && (
            <>
              <FieldControl label={t("Povoliť recenzovanie", "Enable reviews")}>
                {(id) => (
                  <Checkbox
                    id={id}
                    checked={form.watch("enabled")}
                    onCheckedChange={(v) =>
                      form.setValue("enabled", Boolean(v), {
                        shouldDirty: true,
                      })
                    }
                  />
                )}
              </FieldControl>
              <TextField
                name="requiredReviews"
                label={t("Počet požadovaných posudkov", "Required reports")}
                type="number"
                min={1}
                max={10}
              />
              <p>
                {t(
                  "Anonymná spätná väzba sa sprístupní po odovzdaní všetkých požadovaných posudkov.",
                  "Anonymous feedback is released after all required reports are submitted.",
                )}
              </p>
            </>
          )}
          {group === "requirements" &&
            sections.map((s) => (
              <FieldControl
                key={s.value}
                label={s.label}
                hint={t(
                  "Napríklad jazyk rukopisu a formát strán.",
                  "For example, manuscript language and page format.",
                )}
              >
                {(id) => (
                  <Input
                    id={id}
                    value={form.watch("sectionRequirements")[s.value] || ""}
                    onChange={(e) =>
                      form.setValue(
                        "sectionRequirements",
                        {
                          ...form.getValues("sectionRequirements"),
                          [s.value]: e.target.value,
                        },
                        { shouldDirty: true },
                      )
                    }
                  />
                )}
              </FieldControl>
            ))}
          {group === "communication" && (
            <>
              <TextField
                name="instructions"
                multiline
                label={t("Pokyny pre recenzentov", "Reviewer instructions")}
              />
              <TextField
                name="signature"
                multiline
                label={t("Podpis koordinátora", "Coordinator signature")}
              />
              <TextField
                name="replyTo"
                type="email"
                label={t("Adresa pre odpovede", "Reply-to email")}
              />
              <FieldControl
                label={t("Automatické pripomienky", "Automatic reminders")}
                hint={t(
                  "Dva dni pred termínom a dva dni po termíne.",
                  "Two days before and two days after the deadline.",
                )}
              >
                {(id) => (
                  <Checkbox
                    id={id}
                    checked={form.watch("remindersEnabled")}
                    onCheckedChange={(v) =>
                      form.setValue("remindersEnabled", Boolean(v), {
                        shouldDirty: true,
                      })
                    }
                  />
                )}
              </FieldControl>
            </>
          )}
          {group === "questionnaire" && (
            <>
              <QuestionnaireSettings
                forms={forms}
                initial={settings?.questionnaire || null}
                lng={lng}
                onLoadingChange={setLoadingQuestionnaire}
              />
              <FieldControl
                label={t("Nová DOCX šablóna", "New DOCX template")}
                hint={t(
                  "Najviac 20 MiB. Existujúca šablóna zostane, ak nevyberiete novú.",
                  "Maximum 20 MiB. The existing template remains unless replaced.",
                )}
              >
                {(id) => (
                  <Input
                    id={id}
                    type="file"
                    accept=".docx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                )}
              </FieldControl>
              {file && <p>{file.name}</p>}
              {uploading && (
                <p role="status">
                  {t("Nahráva sa", "Uploading")} {progress}%
                </p>
              )}
              <details>
                <summary>
                  {t("Pomoc s DOCX šablónou", "DOCX template help")}
                </summary>
                <p>
                  {"{paper}, {reviewer}, {recommendation}, {answers}, {date}"}
                </p>
                <p>
                  {t(
                    "Značku konkrétnej otázky nájdete v knižnici formulárov.",
                    "Find each question’s placeholder in the form library.",
                  )}
                </p>
              </details>
            </>
          )}
        </>
      )}
    </FormDialog>
  );
}
function QuestionnaireSettings({
  forms,
  initial,
  lng,
  onLoadingChange,
}: {
  forms: FormLibraryQuery["formLibrary"];
  initial: FormFragment | null;
  lng: string;
  onLoadingChange: (loading: boolean) => void;
}) {
  const t = tr(lng);
  const form = useFormContext<Config>();
  const [versions, setVersions] = useState(initial ? [initial] : []);
  const [definition, setDefinition] = useState(initial?.definition || "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const selected = versions.find((v) => v.id === form.watch("form"));
  const fields = selected?.fields || [];
  const recommendations = fields.filter(compatible);
  const chooseVersion = (id: string) => {
    const fields = versions.find((v) => v.id === id)?.fields || [];
    form.setValue("form", id, { shouldDirty: true });
    form.setValue(
      "recommendationField",
      fields.some(
        (f) => f.id === form.getValues("recommendationField") && compatible(f),
      )
        ? form.getValues("recommendationField")
        : "",
      { shouldDirty: true },
    );
    form.setValue(
      "authorFields",
      form
        .getValues("authorFields")
        .filter((id) =>
          fields.some((f) => f.id === id && f.type !== FieldType.FileUpload),
        ),
      { shouldDirty: true },
    );
  };
  async function load(value: string) {
    if (!value && initial) return;
    setPending(true);
    onLoadingChange(true);
    setError("");
    try {
      const result = value ? await getFormVersions(value) : [];
      setDefinition(value);
      setVersions(result);
      if (value !== definition) {
        form.setValue("form", result[0]?.id || "", { shouldDirty: true });
        form.setValue("recommendationField", "", { shouldDirty: true });
        form.setValue("authorFields", [], { shouldDirty: true });
      }
    } catch (e) {
      setError(errorText(e, lng));
    } finally {
      setPending(false);
      onLoadingChange(false);
    }
  }
  return (
    <>
      <ErrorAlert message={error} />
      <FieldControl label={t("Formulár z knižnice", "Library form")}>
        {(id) => (
          <SelectControl
            id={id}
            value={definition}
            options={forms.map((f) => ({ value: f.id, label: f.name }))}
            onChange={(v) => void load(v)}
            disabled={pending}
            empty={t(
              "Základný dotazník pri prvom zapnutí",
              "Baseline questionnaire on first activation",
            )}
          />
        )}
      </FieldControl>
      {definition && (
        <Button
          variant="ghost"
          disabled={pending}
          onClick={() => load(definition)}
        >
          {t("Načítať všetky verzie", "Load all versions")}
        </Button>
      )}
      {versions.length > 0 && (
        <>
          <FieldControl
            label={t("Verzia pre nové kolá", "Version for new rounds")}
          >
            {(id) => (
              <SelectControl
                id={id}
                value={form.watch("form")}
                options={versions.map((v) => ({
                  value: v.id,
                  label: `v${v.version}`,
                }))}
                onChange={chooseVersion}
              />
            )}
          </FieldControl>
          {!recommendations.length ? (
            <Alert variant="destructive">
              <AlertDescription>
                {t(
                  "Dotazník potrebuje povinnú otázku s celkovým odporúčaním. Pridajte ju v knižnici formulárov.",
                  "This questionnaire needs a required overall recommendation question. Add it in the form library.",
                )}
              </AlertDescription>
            </Alert>
          ) : (
            <SelectField
              name="recommendationField"
              label={t("Celkové odporúčanie", "Overall recommendation")}
              options={recommendations.map((f) => ({
                value: f.id,
                label: f.label,
              }))}
            />
          )}
          <p>
            {t(
              "Celkové odporúčanie je vždy viditeľné autorovi. Prílohy zostávajú súkromné.",
              "The overall recommendation is always visible to the author. Attachments remain private.",
            )}
          </p>
          {fields
            .filter((f) => f.type !== FieldType.FileUpload)
            .map((f) => (
              <FieldControl
                key={f.id}
                label={`${t("Viditeľné autorovi", "Visible to author")}: ${f.label}`}
              >
                {(id) => (
                  <Checkbox
                    id={id}
                    checked={
                      f.id === form.watch("recommendationField") ||
                      form.watch("authorFields").includes(f.id)
                    }
                    disabled={f.id === form.watch("recommendationField")}
                    onCheckedChange={(checked) =>
                      form.setValue(
                        "authorFields",
                        checked
                          ? [...form.getValues("authorFields"), f.id]
                          : form
                              .getValues("authorFields")
                              .filter((v) => v !== f.id),
                        { shouldDirty: true },
                      )
                    }
                  />
                )}
              </FieldControl>
            ))}
        </>
      )}
    </>
  );
}
