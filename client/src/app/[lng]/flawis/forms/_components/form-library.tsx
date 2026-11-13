"use client";
import { useState } from "react";
import FormEditor from "./form-editor";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type FormFragment,
  type FormLibraryQuery,
} from "@/lib/graphql/generated/graphql";
import { getFormVersions } from "@/lib/reviews/actions";
import { mutate, errorText } from "@/lib/reviews/ux";
import { localizedText as tr } from "@/lib/i18n/text";
import { AnswerFields } from "@/components/form/answer-fields";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { ErrorAlert } from "@/components/form/field-controls";
import {
  FormDialog,
  SelectField,
  ViewDialog,
  ConfirmDialog,
} from "@/components/form/form-dialog";
type Definition = FormLibraryQuery["formLibrary"][number];
type Editor = { definition?: Definition; version?: FormFragment };
export default function FormLibrary({
  initial,
  initialHistory,
  courses,
  lng,
}: {
  initial: FormLibraryQuery["formLibrary"];
  initialHistory: { definition: Definition; versions: FormFragment[] } | null;
  courses: { id: string; name: string }[];
  lng: string;
}) {
  const t = tr(lng);
  const router = useRouter();
  const params = useSearchParams();
  const [editor, setEditor] = useState<Editor | null>(null);
  const [history, setHistory] = useState<{
    definition: Definition;
    versions: FormFragment[];
  } | null>(initialHistory);
  const [preview, setPreview] = useState<FormFragment | null>(null);
  const [binding, setBinding] = useState<FormFragment | null>(null);
  const [archiving, setArchiving] = useState<Definition | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  function closeSelectedForm() {
    if (!params.has("form")) return;
    const next = new URLSearchParams(params);
    next.delete("form");
    router.replace(`/forms${next.size ? `?${next}` : ""}`, { scroll: false });
  }
  async function load(definition: Definition, edit = false) {
    setPending(true);
    setError("");
    try {
      const versions = await getFormVersions(definition.id);
      if (edit) setEditor({ definition, version: versions[0] });
      else setHistory({ definition, versions });
    } catch (e) {
      setError(errorText(e, lng));
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            {t("Knižnica formulárov", "Form library")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "Opakovane použiteľné formuláre. Publikované verzie sa nemenia.",
              "Reusable forms. Published versions are immutable.",
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setEditor({})}>
            {t("Vytvoriť formulár", "Create form")}
          </Button>
        </div>
      </div>
      <ErrorAlert message={error} />
      <div className="grid gap-4 md:grid-cols-2">
        {initial.map((f) => (
          <Card key={f.id}>
            <CardHeader>
              <CardTitle>{f.name}</CardTitle>
              <CardDescription>{f.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">v{f.latestVersion}</Badge>
            </CardContent>
            <CardFooter className="flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={pending}
                onClick={() => load(f, true)}
              >
                {t("Upraviť novú verziu", "Edit new version")}
              </Button>
              <Button
                variant="ghost"
                disabled={pending}
                onClick={() => load(f)}
              >
                {t("Verzie a použitie", "Versions and use")}
              </Button>
              <Button variant="ghost" onClick={() => setArchiving(f)}>
                {t("Archivovať", "Archive")}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {!initial.length && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              {t(
                "Vytvorte prvý zdieľaný formulár",
                "Create your first shared form",
              )}
            </EmptyTitle>
          </EmptyHeader>
        </Empty>
      )}
      {editor && (
        <FormEditor
          key={`${editor.definition?.id || "new"}:${editor.version?.id || "new"}`}
          editor={editor}
          createDefinition={(data) =>
            mutate<{ id: string }>("createForm", data)
          }
          publishVersion={(data) => mutate("publishForm", data)}
          lng={lng}
          onClose={() => {
            setEditor(null);
            closeSelectedForm();
          }}
          onSaved={() => router.refresh()}
        />
      )}
      {history && (
        <ViewDialog
          lng={lng}
          title={`${history.definition.name} · ${t("Verzie", "Versions")}`}
          onClose={() => {
            setHistory(null);
            closeSelectedForm();
          }}
        >
          <div className="flex flex-col gap-3">
            {history.versions.map((v) => (
              <div key={v.id} className="flex flex-wrap items-center gap-2">
                <span>
                  v{v.version} · {v.fields.length} {t("polí", "fields")}
                </span>
                <Button
                  variant="outline"
                  onClick={() => {
                    setHistory(null);
                    setPreview(v);
                  }}
                >
                  {t("Náhľad", "Preview")}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setHistory(null);
                    setEditor({ definition: history.definition, version: v });
                  }}
                >
                  {t(
                    "Použiť ako základ novej verzie",
                    "Use as a new version’s starting point",
                  )}
                </Button>
                <Button
                  variant="ghost"
                  disabled={!courses.length}
                  onClick={() => {
                    setHistory(null);
                    setBinding(v);
                  }}
                >
                  {t("Priradiť kurzu", "Assign to course")}
                </Button>
              </div>
            ))}
            <p className="text-sm text-muted-foreground">
              {t(
                "Formulár pre recenzie vyberte v nastaveniach konferencie. Existujúce prihlášky a kolá si ponechajú pôvodnú verziu.",
                "Select review questionnaires in conference settings. Existing applications and rounds keep their original version.",
              )}
            </p>
          </div>
        </ViewDialog>
      )}
      {preview && (
        <ViewDialog
          title={`${initial.find((f) => f.id === preview.definition)?.name || t("Formulár", "Form")} · v${preview.version}`}
          lng={lng}
          onClose={() => {
            setPreview(null);
            closeSelectedForm();
          }}
          wide
        >
          <AnswerFields
            fields={preview.fields}
            values={{}}
            onChange={() => {}}
            disabled
            lng={lng}
          />
        </ViewDialog>
      )}
      {binding && (
        <FormDialog
          formatError={(error) => errorText(error, lng)}
          title={t("Priradiť formulár kurzu", "Assign form to course")}
          description={`${initial.find((f) => f.id === binding.definition)?.name || t("Formulár", "Form")} v${binding.version}. ${t("Použije sa pre nové prihlášky.", "Applies to new applications.")}`}
          lng={lng}
          defaultValues={{ course: "" }}
          schema={z.object({
            course: z.string().min(1, t("Vyberte kurz.", "Choose a course.")),
          })}
          onClose={() => {
            setBinding(null);
            closeSelectedForm();
          }}
          onSubmit={async (data) => {
            await mutate("bindForm", { course: data.course, form: binding.id });
            router.refresh();
          }}
        >
          {() => (
            <SelectField
              name="course"
              label={t("Kurz", "Course")}
              options={courses.map((c) => ({ value: c.id, label: c.name }))}
            />
          )}
        </FormDialog>
      )}
      {archiving && (
        <ConfirmDialog
          formatError={(error) => errorText(error, lng)}
          title={t("Archivovať formulár", "Archive form")}
          description={`${archiving.name}. ${t("Existujúce použitia a odpovede sa zachovajú.", "Existing uses and answers are preserved.")}`}
          lng={lng}
          onClose={() => setArchiving(null)}
          onConfirm={async () => {
            await mutate("archiveForm", { definition: archiving.id });
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
