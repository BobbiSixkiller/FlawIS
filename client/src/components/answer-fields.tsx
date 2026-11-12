"use client";
import { useState, type AriaAttributes, type ReactNode } from "react";
import RichTextHelp from "./rich-text-help";
import { Button } from "@/components/ui/button";
import { localizedText as tr } from "@/lib/i18n/text";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldGroup } from "@/components/ui/field";
import MultipleFileUploadField from "./multiple-file-upload-field";
import RadioGroupField from "./radio-group-field";
import {
  ErrorAlert,
  FieldControl,
  SelectControl,
} from "@/components/field-controls";
import { FieldType, type FormFragment } from "@/lib/graphql/generated/graphql";

type Definition = FormFragment["fields"][number];
/** Shared controls used by course registrations and submission review forms. */
export function AnswerFieldControl({
  definition,
  value,
  onChange,
  disabled,
  fileControl,
  ...props
}: AriaAttributes & {
  id: string;
  definition: Definition;
  value?: string | string[] | File[];
  onChange: (value: string) => void;
  disabled?: boolean;
  fileControl?: ReactNode;
}) {
  if (definition.type === FieldType.FileUpload) return fileControl || null;
  const text = typeof value === "string" ? value : "";
  if (definition.type === FieldType.RadioGroup)
    return (
      <RadioGroupField
        {...props}
        disabled={disabled}
        value={text}
        options={definition.selectOptions || []}
        onChange={onChange}
      />
    );
  if (definition.type === FieldType.Select)
    return (
      <SelectControl
        {...props}
        empty={definition.placeholder || "—"}
        disabled={disabled}
        value={text}
        options={
          definition.selectOptions?.map((o) => ({
            value: o.value,
            label: o.text,
          })) || []
        }
        onChange={onChange}
      />
    );
  if (definition.type === FieldType.Textarea)
    return (
      <Textarea
        {...props}
        disabled={disabled}
        rows={6}
        placeholder={definition.placeholder || ""}
        value={text}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  return (
    <Input
      {...props}
      disabled={disabled}
      placeholder={definition.placeholder || ""}
      value={text}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
export function AnswerFields({
  fields,
  values,
  onChange,
  disabled,
  upload,
  lng = "en",
  errors = {},
  fieldAnnotations,
  attachments = [],
  onUploadingChange,
  preview = false,
}: {
  lng?: string;
  preview?: boolean;
  errors?: Record<string, string>;
  /** Caller-owned domain labels, such as who can see an answer. */
  fieldAnnotations?: Record<string, ReactNode>;
  attachments?: { id: string; filename: string }[];
  onUploadingChange?: (value: boolean) => void;
  fields: Definition[];
  values: Record<string, string | string[]>;
  onChange: (id: string, value: string | string[]) => void;
  disabled?: boolean;
  upload?: (
    file: File,
    onProgress?: (percent: number) => void,
  ) => Promise<string>;
}) {
  const t = tr(lng);
  const [previewFiles, setPreviewFiles] = useState<Record<string, File[]>>({});
  const [filenames, setFilenames] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadName, setUploadName] = useState("");
  return (
    <FieldGroup>
      <ErrorAlert message={error} />
      {fields.map((f) => (
        <FieldControl
          key={f.id}
          label={`${f.label}${f.required ? " *" : ""}`}
          hint={f.helpText ? <RichTextHelp html={f.helpText} /> : undefined}
          error={errors[f.id]}
          fieldId={f.id}
        >
          {(id) => (
            <>
              {fieldAnnotations?.[f.id]}
              <AnswerFieldControl
                aria-labelledby={`${id}-label`}
                aria-required={f.required}
                aria-invalid={Boolean(errors[f.id])}
                aria-describedby={
                  errors[f.id]
                    ? `${id}-error`
                    : f.helpText
                      ? `${id}-hint`
                      : undefined
                }
                id={id}
                definition={f}
                value={values[f.id]}
                onChange={(value) => onChange(f.id, value)}
                disabled={disabled}
                fileControl={
                  <div className="flex flex-col gap-2">
                    <MultipleFileUploadField
                      id={id}
                      lng={lng}
                      aria-labelledby={`${id}-label`}
                      aria-invalid={Boolean(errors[f.id])}
                      aria-describedby={
                        errors[f.id] ? `${id}-error` : `${id}-limits`
                      }
                      accept={{
                        "application/pdf": [".pdf"],
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                          [".docx"],
                      }}
                      maxSize={20 * 1024 * 1024}
                      maxFiles={f.maxFiles ?? 10}
                      existingCount={
                        preview
                          ? 0
                          : Array.isArray(values[f.id])
                            ? values[f.id].length
                            : 0
                      }
                      value={preview ? previewFiles[f.id] || [] : []}
                      disabled={
                        disabled || (!upload && !preview) || uploading !== null
                      }
                      onError={setError}
                      onChange={async (files) => {
                        setError("");
                        if (preview) {
                          setPreviewFiles((current) => ({
                            ...current,
                            [f.id]: files,
                          }));
                          onChange(
                            f.id,
                            files.map((file, i) => `preview-${i}-${file.name}`),
                          );
                          return;
                        }
                        if (!upload || !files.length) return;
                        const existing = Array.isArray(values[f.id])
                          ? (values[f.id] as string[])
                          : [];
                        setUploading(f.id);
                        onUploadingChange?.(true);
                        try {
                          const added = [...existing];
                          for (const file of files) {
                            setUploadName(file.name);
                            setUploadProgress(0);
                            const fileId = await upload(
                              file,
                              setUploadProgress,
                            );
                            added.push(fileId);
                            setFilenames((current) => ({
                              ...current,
                              [fileId]: file.name,
                            }));
                            onChange(f.id, [...added]);
                          }
                        } catch (e) {
                          setError(
                            e instanceof Error
                              ? e.message
                              : t("Nahrávanie zlyhalo.", "Upload failed."),
                          );
                        } finally {
                          setUploading(null);
                          onUploadingChange?.(false);
                        }
                      }}
                    />
                    {uploading === f.id && (
                      <p role="status">
                        {t("Nahráva sa", "Uploading")} {uploadName} ·{" "}
                        {uploadProgress}%
                      </p>
                    )}
                    <p
                      id={`${id}-limits`}
                      className="text-xs text-muted-foreground"
                    >
                      {t(
                        "DOCX alebo PDF, najviac 20 MiB na súbor.",
                        "DOCX or PDF, maximum 20 MiB per file.",
                      )}{" "}
                      {t("Počet súborov", "File count")}:{" "}
                      {Math.max(
                        f.required ? 1 : 0,
                        f.minFiles ?? (f.required ? 1 : 0),
                      )}
                      –{f.maxFiles ?? 10}.
                      {!f.required &&
                        (f.minFiles ?? 0) > 0 &&
                        ` ${t("Nepovinné; minimum platí pri priložení súborov.", "Optional; the minimum applies when attaching files.")}`}
                    </p>
                    {!preview &&
                      Array.isArray(values[f.id]) &&
                      (values[f.id] as string[]).map((fileId, index) => (
                        <div
                          key={fileId}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="text-sm">
                            {filenames[fileId] ||
                              attachments.find((a) => a.id === fileId)
                                ?.filename ||
                              `${t("Príloha", "Attachment")} ${index + 1}`}
                          </span>
                          {!disabled && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={uploading !== null}
                              onClick={() =>
                                onChange(
                                  f.id,
                                  (values[f.id] as string[]).filter(
                                    (v) => v !== fileId,
                                  ),
                                )
                              }
                            >
                              {t("Odobrať", "Remove")}
                            </Button>
                          )}
                        </div>
                      ))}
                  </div>
                }
              />
            </>
          )}
        </FieldControl>
      ))}
    </FieldGroup>
  );
}

export function validateAnswerFields(
  fields: Definition[],
  values: Record<string, string | string[]>,
  lng: string,
) {
  const errors: Record<string, string> = {};
  const t = tr(lng);
  for (const field of fields) {
    const value = values[field.id];
    if (
      field.required &&
      (!value || (typeof value === "string" ? !value.trim() : !value.length))
    )
      errors[field.id] = t(
        "Vyplňte povinnú odpoveď.",
        "Complete this required answer.",
      );
    if (
      field.type === FieldType.FileUpload &&
      Array.isArray(value) &&
      value.length
    ) {
      const min = Math.max(field.required ? 1 : 0, field.minFiles ?? 1);
      const max = field.maxFiles ?? 10;
      if (value.length < min || value.length > max)
        errors[field.id] = t(
          `Priložte ${min} až ${max} súborov.`,
          `Attach ${min} to ${max} files.`,
        );
    }
  }
  return errors;
}
