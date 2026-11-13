"use client";
import { useRef, useState } from "react";
import { z } from "zod";
import { Controller } from "react-hook-form";
import { FormDialog } from "@/components/form/form-dialog";
import { FieldControl } from "@/components/form/field-controls";
import { Input } from "@/components/ui/input";
import { localizedText } from "@/lib/i18n/text";

/** Retains the selected file and a successful upload across save retries. Uploading alone
 * does not publish the template; the caller saves its reference after upload succeeds.
 */
export default function TemplateEditor({
  lng,
  title,
  description,
  onUpload,
  onSave,
  onClose,
}: {
  lng: string;
  title: string;
  description: string;
  onUpload: (
    file: File,
    progress: (value: number) => void,
  ) => Promise<{ id: string }>;
  onSave: (id: string) => Promise<void>;
  onClose: () => void;
}) {
  const t = localizedText(lng);
  const [progress, setProgress] = useState<number | null>(null);
  const uploaded = useRef<{ file: File; id: string } | null>(null);
  const schema = z.object({
    file: z
      .file({ error: t("Vyberte DOCX súbor.", "Choose a DOCX file.") })
      .min(1, t("Súbor je prázdny.", "The file is empty."))
      .max(
        20 * 1024 * 1024,
        t(
          "Najväčšia povolená veľkosť je 20 MiB.",
          "Maximum file size: 20 MiB.",
        ),
      )
      .refine(
        (file) => /\.docx$/i.test(file.name),
        t("Vyberte DOCX súbor.", "Choose a DOCX file."),
      ),
  });
  return (
    <FormDialog
      lng={lng}
      title={title}
      description={description}
      schema={schema}
      defaultValues={{}}
      onClose={onClose}
      onSubmit={async ({ file }) => {
        if (uploaded.current?.file !== file) {
          setProgress(0);
          try {
            uploaded.current = { file, ...(await onUpload(file, setProgress)) };
          } finally {
            setProgress(null);
          }
        }
        await onSave(uploaded.current.id);
      }}
    >
      {(form) => (
        <>
          <FieldControl
            label={t("DOCX súbor", "DOCX file")}
            hint={t(
              "Najviac 20 MiB. Aktuálna šablóna zostane dostupná, kým neuložíte novú.",
              "Maximum 20 MiB. The current template remains available until you save the new one.",
            )}
            error={form.formState.errors.file?.message}
          >
            {(id) => (
              <Controller
                control={form.control}
                name="file"
                render={({ field }) => (
                  <Input
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    id={id}
                    type="file"
                    accept=".docx"
                    disabled={form.formState.isSubmitting}
                    aria-invalid={Boolean(form.formState.errors.file)}
                    aria-describedby={`${id}-hint${form.formState.errors.file ? ` ${id}-error` : ""}`}
                    onChange={(event) =>
                      field.onChange(event.target.files?.[0])
                    }
                  />
                )}
              />
            )}
          </FieldControl>
          {progress !== null && (
            <p role="status">
              {t("Nahráva sa", "Uploading")} {progress}%
            </p>
          )}
        </>
      )}
    </FormDialog>
  );
}
