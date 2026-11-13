"use client";
import RichTextHelp from "@/components/form/rich-text-help";
import type { RegistrationValues } from "@/lib/validation/registration-form-schema";
import { FormField } from "@/components/form/form";
import { AnswerFieldControl } from "@/components/form/answer-fields";
import MultipleFileUploadField from "@/components/form/multiple-file-upload-field";
import { FieldType, type FormFragment } from "@/lib/graphql/generated/graphql";
export default function RegistrationFormFields({
  fields,
  lng,
  canEdit,
  existingAnswers,
}: {
  fields: FormFragment["fields"];
  canEdit: boolean;
  existingAnswers?: Record<string, string | string[]>;
  lng: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      {fields.map((definition) => (
        <FormField<RegistrationValues, `field_${string}`>
          key={definition.id}
          name={`field_${definition.id}`}
          label={definition.label}
          description={
            definition.helpText ? (
              <RichTextHelp html={definition.helpText} />
            ) : undefined
          }
        >
          {({ field, controlProps, initialize, onError }) => (
            <AnswerFieldControl
              {...controlProps}
              definition={definition}
              value={field.value}
              onChange={field.onChange}
              disabled={!canEdit}
              fileControl={
                definition.type === FieldType.FileUpload ? (
                  <MultipleFileUploadField
                    lng={lng}
                    {...field}
                    {...controlProps}
                    value={field.value as File[] | undefined}
                    disabled={!canEdit}
                    maxFiles={definition.maxFiles ?? 10}
                    fileSources={{ courses: existingAnswers?.[definition.id] }}
                    onLoad={initialize}
                    onError={onError}
                  />
                ) : undefined
              }
            />
          )}
        </FormField>
      ))}
    </div>
  );
}
