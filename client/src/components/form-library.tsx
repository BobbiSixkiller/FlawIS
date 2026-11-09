"use client";
import { useState } from "react";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FieldType,
  type FormFieldInput,
  type FormFragment,
  type FormLibraryQuery,
} from "@/lib/graphql/generated/graphql";
import { getFormVersions } from "@/lib/reviews/actions";
import { mutate, tr, errorText } from "@/lib/reviews/ux";
import { AnswerFields } from "./answer-fields";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card";
import { FieldGroup } from "./ui/field";
import { Empty, EmptyHeader, EmptyTitle } from "./ui/empty";
import { ReviewError, ReviewField, ReviewSelect } from "./review-controls";
import {
  FormDialog,
  TextField,
  SelectField,
  ViewDialog,
  ConfirmDialog,
} from "./reviews/form-dialog";
const objectId = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(12)), (n) =>
    n.toString(16).padStart(2, "0"),
  ).join("");
const fromVersion = (form: FormFragment): FormFieldInput[] =>
  form.fields.map(
    ({
      id,
      type,
      label,
      required,
      placeholder,
      helpText,
      selectOptions,
      minFiles,
      maxFiles,
    }) => ({
      id,
      type,
      label,
      required,
      placeholder,
      helpText,
      selectOptions,
      minFiles:
        type === FieldType.FileUpload
          ? Math.max(required ? 1 : 0, minFiles ?? (required ? 1 : 0))
          : minFiles,
      maxFiles: type === FieldType.FileUpload ? (maxFiles ?? 10) : maxFiles,
    }),
  );
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
              "Zdieľané dotazníky pre kurzy a recenzie. Publikované verzie sa nemenia.",
              "Shared questionnaires for courses and reviews. Published versions are immutable.",
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setEditor({})}>
            {t("Vytvoriť formulár", "Create form")}
          </Button>
        </div>
      </div>
      <ReviewError message={error} />
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
        <FormBuilder
          key={`${editor.definition?.id || "new"}:${editor.version?.id || "new"}`}
          editor={editor}
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
                  v{v.version} · {v.fields.length} {t("otázok", "questions")}
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
function FormBuilder({
  editor,
  lng,
  onClose,
  onSaved,
}: {
  editor: Editor;
  lng: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = tr(lng);
  const [createdId, setCreatedId] = useState(editor.definition?.id);
  const [tab, setTab] = useState("questions");
  const [preview, setPreview] = useState<Record<string, string | string[]>>({});
  const fieldSchema = z.custom<FormFieldInput>().superRefine((field, ctx) => {
    if (!field.label?.trim())
      ctx.addIssue({
        code: "custom",
        path: ["label"],
        message: t(
          "Každá otázka potrebuje text.",
          "Each question needs a label.",
        ),
      });
    if (field.type === FieldType.FileUpload) {
      const min = field.minFiles ?? (field.required ? 1 : 0);
      const max = field.maxFiles ?? 10;
      if (!Number.isInteger(min) || min < (field.required ? 1 : 0) || min > 20)
        ctx.addIssue({
          code: "custom",
          path: ["minFiles"],
          message: t(
            "Zadajte platný minimálny počet súborov.",
            "Enter a valid minimum file count.",
          ),
        });
      if (!Number.isInteger(max) || max < 1 || max > 20 || max < min)
        ctx.addIssue({
          code: "custom",
          path: ["maxFiles"],
          message: t(
            "Maximum musí byť 1 až 20 a nesmie byť menšie než minimum.",
            "Maximum must be 1 to 20 and at least the minimum.",
          ),
        });
    }
    if ([FieldType.Select, FieldType.RadioGroup].includes(field.type)) {
      if (!field.selectOptions?.length)
        ctx.addIssue({
          code: "custom",
          path: ["selectOptions"],
          message: t(
            "Doplňte možnosti odpovede.",
            "Complete the answer choices.",
          ),
        });
      field.selectOptions?.forEach((choice, index) => {
        if (!choice.text.trim())
          ctx.addIssue({
            code: "custom",
            path: ["selectOptions", index, "text"],
            message: t("Zadajte text možnosti.", "Enter a choice label."),
          });
      });
    }
  });
  const schema = z.object({
    name: z.string().trim().min(1, t("Zadajte názov.", "Enter a name.")),
    description: z.string(),
    fields: z
      .array(fieldSchema)
      .min(1, t("Pridajte otázku.", "Add a question.")),
  });
  const types = [
    { value: FieldType.Text, label: t("Krátky text", "Short text") },
    { value: FieldType.Textarea, label: t("Dlhý text", "Long text") },
    { value: FieldType.Select, label: t("Rozbaľovací výber", "Dropdown") },
    { value: FieldType.RadioGroup, label: t("Jedna možnosť", "Single choice") },
    { value: FieldType.FileUpload, label: t("Prílohy", "Attachments") },
  ];
  return (
    <FormDialog
      wide
      lng={lng}
      title={
        editor.definition
          ? `${t("Nová verzia", "New version")}: ${editor.definition.name}`
          : t("Nový formulár", "New form")
      }
      description={t(
        "Publikovanie vytvorí nemennú verziu. Existujúce kolá a prihlášky sa nezmenia.",
        "Publishing creates an immutable version. Existing rounds and applications are unchanged.",
      )}
      schema={schema}
      defaultValues={{
        name: editor.definition?.name || "",
        description: editor.definition?.description || "",
        fields: editor.version ? fromVersion(editor.version) : [],
      }}
      onClose={onClose}
      onInvalid={() => setTab("questions")}
      submitLabel={t("Publikovať novú verziu", "Publish new version")}
      onSubmit={async (data) => {
        let id = createdId;
        if (!id) {
          id = (
            await mutate<{ id: string }>("createForm", {
              name: data.name,
              description: data.description,
            })
          ).id;
          setCreatedId(id);
        }
        await mutate("publishForm", { definition: id, ...data });
        onSaved();
      }}
    >
      {(form) => {
        const fields = form.watch("fields");
        const update = (index: number, values: Partial<FormFieldInput>) =>
          form.setValue(
            "fields",
            fields.map((field, i) =>
              i === index ? { ...field, ...values } : field,
            ),
            { shouldDirty: true },
          );
        function add(recommendation = false) {
          form.setValue(
            "fields",
            [
              ...fields,
              recommendation
                ? {
                    id: objectId(),
                    type: FieldType.RadioGroup,
                    label: t("Celkové odporúčanie", "Overall recommendation"),
                    required: true,
                    selectOptions: [
                      {
                        value: "PUBLISH",
                        text: t(
                          "Odporúčam publikovať",
                          "Recommend publication",
                        ),
                      },
                      {
                        value: "CONDITIONAL",
                        text: t(
                          "Publikovať po úpravách",
                          "Publish after revisions",
                        ),
                      },
                      {
                        value: "REJECT",
                        text: t("Neodporúčam publikovať", "Do not publish"),
                      },
                    ],
                  }
                : {
                    id: objectId(),
                    type: FieldType.Text,
                    label: "",
                    required: false,
                  },
            ],
            { shouldDirty: true },
          );
        }
        return (
          <>
            <TextField name="name" label={t("Názov", "Name")} />
            <TextField
              name="description"
              multiline
              label={t("Popis", "Description")}
            />
            <Tabs value={tab} onValueChange={(value) => setTab(String(value))}>
              <TabsList>
                <TabsTrigger value="questions">
                  {t("Otázky", "Questions")}
                </TabsTrigger>
                <TabsTrigger value="preview">
                  {t("Náhľad", "Preview")}
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="questions"
                className="flex flex-col gap-4 pt-3"
              >
                <ReviewError
                  message={
                    form.formState.errors.fields?.message ||
                    (form.formState.errors.fields
                      ? t(
                          "Skontrolujte otázky a ich možnosti.",
                          "Check question labels and answer choices.",
                        )
                      : "")
                  }
                />
                {fields.map((field, index) => (
                  <Card key={field.id || index} size="sm">
                    <CardHeader>
                      <CardTitle>
                        {index + 1}.{" "}
                        {field.label || t("Nová otázka", "New question")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FieldGroup>
                        <ReviewField
                          label={t("Text otázky", "Question text")}
                          error={
                            form.formState.errors.fields?.[index]?.label
                              ?.message
                          }
                        >
                          {(id) => (
                            <Input
                              id={id}
                              {...form.register(`fields.${index}.label`)}
                              aria-invalid={Boolean(
                                form.formState.errors.fields?.[index]?.label,
                              )}
                              value={field.label}
                              onChange={(e) =>
                                update(index, { label: e.target.value })
                              }
                            />
                          )}
                        </ReviewField>
                        <ReviewField label={t("Typ odpovede", "Answer type")}>
                          {(id) => (
                            <ReviewSelect
                              id={id}
                              value={field.type}
                              options={types}
                              onChange={(value) =>
                                update(index, {
                                  type: value as FieldType,
                                  ...(value === FieldType.FileUpload
                                    ? {
                                        minFiles:
                                          field.minFiles ??
                                          (field.required ? 1 : 0),
                                        maxFiles: field.maxFiles ?? 10,
                                      }
                                    : {}),
                                })
                              }
                            />
                          )}
                        </ReviewField>
                        <ReviewField
                          label={t("Povinná odpoveď", "Required answer")}
                        >
                          {(id) => (
                            <Checkbox
                              id={id}
                              checked={field.required}
                              onCheckedChange={(v) =>
                                update(index, {
                                  required: Boolean(v),
                                  ...(field.type === FieldType.FileUpload && v
                                    ? {
                                        minFiles: Math.max(
                                          1,
                                          field.minFiles ?? 0,
                                        ),
                                      }
                                    : {}),
                                })
                              }
                            />
                          )}
                        </ReviewField>
                        <ReviewField label={t("Pomocný text", "Help text")}>
                          {(id) => (
                            <Textarea
                              id={id}
                              value={field.helpText || ""}
                              onChange={(e) =>
                                update(index, { helpText: e.target.value })
                              }
                            />
                          )}
                        </ReviewField>
                        {[FieldType.Select, FieldType.RadioGroup].includes(
                          field.type,
                        ) && (
                          <FieldGroup>
                            {field.selectOptions?.map((choice, i) => (
                              <ReviewField
                                key={choice.value}
                                label={`${t("Možnosť", "Choice")} ${i + 1}`}
                                error={
                                  form.formState.errors.fields?.[index]
                                    ?.selectOptions?.[i]?.text?.message
                                }
                              >
                                {(id) => (
                                  <div className="flex gap-2">
                                    <Input
                                      id={id}
                                      {...form.register(
                                        `fields.${index}.selectOptions.${i}.text`,
                                      )}
                                      aria-invalid={Boolean(
                                        form.formState.errors.fields?.[index]
                                          ?.selectOptions?.[i]?.text,
                                      )}
                                      value={choice.text}
                                      onChange={(e) =>
                                        update(index, {
                                          selectOptions:
                                            field.selectOptions!.map((c, j) =>
                                              i === j
                                                ? { ...c, text: e.target.value }
                                                : c,
                                            ),
                                        })
                                      }
                                    />
                                    <Button
                                      variant="ghost"
                                      onClick={() =>
                                        update(index, {
                                          selectOptions:
                                            field.selectOptions!.filter(
                                              (_, j) => j !== i,
                                            ),
                                        })
                                      }
                                    >
                                      {t("Odobrať", "Remove")}
                                    </Button>
                                  </div>
                                )}
                              </ReviewField>
                            ))}
                            <Button
                              variant="outline"
                              onClick={() =>
                                update(index, {
                                  selectOptions: [
                                    ...(field.selectOptions || []),
                                    { value: objectId(), text: "" },
                                  ],
                                })
                              }
                            >
                              {t("Pridať možnosť", "Add choice")}
                            </Button>
                          </FieldGroup>
                        )}
                        {field.type === FieldType.FileUpload && (
                          <FieldGroup className="sm:grid sm:grid-cols-2">
                            <ReviewField
                              label={t(
                                "Najmenej príloh",
                                "Minimum attachments",
                              )}
                              hint={
                                !field.required
                                  ? t(
                                      "Nepovinné; minimum platí pri priložení súborov.",
                                      "Optional; the minimum applies when attaching files.",
                                    )
                                  : undefined
                              }
                              error={
                                form.formState.errors.fields?.[index]?.minFiles
                                  ?.message
                              }
                            >
                              {(id) => (
                                <Input
                                  id={id}
                                  type="number"
                                  min={field.required ? 1 : 0}
                                  max={20}
                                  {...form.register(
                                    `fields.${index}.minFiles`,
                                    { valueAsNumber: true },
                                  )}
                                  aria-invalid={Boolean(
                                    form.formState.errors.fields?.[index]
                                      ?.minFiles,
                                  )}
                                  value={
                                    field.minFiles ?? (field.required ? 1 : 0)
                                  }
                                  onChange={(e) =>
                                    update(index, {
                                      minFiles: e.target.valueAsNumber,
                                    })
                                  }
                                />
                              )}
                            </ReviewField>
                            <ReviewField
                              label={t("Najviac príloh", "Maximum attachments")}
                              error={
                                form.formState.errors.fields?.[index]?.maxFiles
                                  ?.message
                              }
                            >
                              {(id) => (
                                <Input
                                  id={id}
                                  type="number"
                                  min={1}
                                  max={20}
                                  {...form.register(
                                    `fields.${index}.maxFiles`,
                                    { valueAsNumber: true },
                                  )}
                                  aria-invalid={Boolean(
                                    form.formState.errors.fields?.[index]
                                      ?.maxFiles,
                                  )}
                                  value={field.maxFiles ?? 10}
                                  onChange={(e) =>
                                    update(index, {
                                      maxFiles: e.target.valueAsNumber,
                                    })
                                  }
                                />
                              )}
                            </ReviewField>
                          </FieldGroup>
                        )}
                      </FieldGroup>
                    </CardContent>
                    <CardFooter className="flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        disabled={index === 0}
                        onClick={() => {
                          const next = [...fields];
                          [next[index - 1], next[index]] = [
                            next[index],
                            next[index - 1],
                          ];
                          form.setValue("fields", next, { shouldDirty: true });
                        }}
                      >
                        {t("Vyššie", "Move up")}
                      </Button>
                      <Button
                        variant="ghost"
                        disabled={index === fields.length - 1}
                        onClick={() => {
                          const next = [...fields];
                          [next[index + 1], next[index]] = [
                            next[index],
                            next[index + 1],
                          ];
                          form.setValue("fields", next, { shouldDirty: true });
                        }}
                      >
                        {t("Nižšie", "Move down")}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          form.setValue(
                            "fields",
                            fields.filter((_, i) => i !== index),
                            { shouldDirty: true },
                          )
                        }
                      >
                        {t("Odstrániť otázku", "Remove question")}
                      </Button>
                      <details className="text-xs text-muted-foreground">
                        <summary>
                          {t(
                            "Značka pre DOCX šablónu",
                            "DOCX template placeholder",
                          )}
                        </summary>
                        <code>{`{answer_${field.id}}`}</code>
                      </details>
                    </CardFooter>
                  </Card>
                ))}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => add()}>
                    {t("Pridať otázku", "Add question")}
                  </Button>
                  <Button variant="outline" onClick={() => add(true)}>
                    {t(
                      "Pridať celkové odporúčanie",
                      "Add overall recommendation",
                    )}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="preview" className="pt-3">
                <AnswerFields
                  preview
                  lng={lng}
                  fields={fields.map((f) => ({
                    ...f,
                    id: f.id!,
                    helpText: f.helpText || null,
                    placeholder: f.placeholder || null,
                    minFiles: f.minFiles ?? null,
                    maxFiles: f.maxFiles ?? null,
                    selectOptions: f.selectOptions || null,
                  }))}
                  values={preview}
                  onChange={(id, value) =>
                    setPreview((current) => ({ ...current, [id]: value }))
                  }
                />
              </TabsContent>
            </Tabs>
          </>
        );
      }}
    </FormDialog>
  );
}
