"use client";

import { useState } from "react";
import { z } from "zod";
import FormBuilder from "@/components/form/form-builder";
import { FormDialog, TextField } from "@/components/form/form-dialog";
import {
  FieldType,
  type FormFieldInput,
  type FormFragment,
} from "@/lib/graphql/generated/graphql";
import { editableFormFields } from "@/lib/forms/builder";
import { createFormFieldsSchema } from "@/lib/validation/form-builder-schema";
import { localizedText as tr } from "@/lib/i18n/text";
import { errorText } from "@/lib/reviews/ux";

type FormMetadata = { name: string; description: string };
type Publish = FormMetadata & { definition: string; fields: FormFieldInput[] };

/** Owns the library publication lifecycle; a failed publish reuses the created definition. */
export default function FormEditor({
  editor,
  lng,
  onClose,
  onSaved,
  createDefinition,
  publishVersion,
}: {
  editor: {
    definition?: FormMetadata & { id: string };
    version?: FormFragment;
  };
  lng: string;
  onClose: () => void;
  onSaved: () => void;
  createDefinition: (data: FormMetadata) => Promise<{ id: string }>;
  publishVersion: (data: Publish) => Promise<unknown>;
}) {
  const t = tr(lng);
  const [createdId, setCreatedId] = useState(editor.definition?.id);
  const schema = z.object({
    name: z
      .string()
      .trim()
      .min(1, t("Zadajte názov.", "Enter a name."))
      .max(200),
    description: z.string().max(5000),
    formFields: createFormFieldsSchema(lng, 1),
  });
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
        "Publikovanie vytvorí nemennú verziu. Už používané verzie sa nezmenia.",
        "Publishing creates an immutable version. Versions already in use are unchanged.",
      )}
      schema={schema}
      defaultValues={{
        name: editor.definition?.name ?? "",
        description: editor.definition?.description ?? "",
        formFields: editor.version ? editableFormFields(editor.version) : [],
      }}
      onClose={onClose}
      formatError={(error) => errorText(error, lng)}
      submitLabel={t("Publikovať novú verziu", "Publish new version")}
      onSubmit={async ({ formFields, ...metadata }) => {
        let definition = createdId;
        if (!definition) {
          definition = (await createDefinition(metadata)).id;
          setCreatedId(definition);
        }
        await publishVersion({ ...metadata, definition, fields: formFields });
        onSaved();
      }}
    >
      {() => (
        <>
          <TextField name="name" label={t("Názov", "Name")} />
          <TextField
            name="description"
            multiline
            label={t("Popis", "Description")}
          />
          <FormBuilder
            lng={lng}
            showTemplatePlaceholders
            presets={[
              {
                key: "recommendation",
                label: t(
                  "Pridať celkové odporúčanie",
                  "Add overall recommendation",
                ),
                field: {
                  type: FieldType.RadioGroup,
                  label: t("Celkové odporúčanie", "Overall recommendation"),
                  required: true,
                  selectOptions: [
                    {
                      value: "PUBLISH",
                      text: t("Odporúčam publikovať", "Recommend publication"),
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
                },
              },
            ]}
          />
        </>
      )}
    </FormDialog>
  );
}
