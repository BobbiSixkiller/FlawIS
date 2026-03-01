"use client";

import { Input } from "@/components/Input";
import MultipleFileUploadField from "@/components/MultipleFileUploadField";
import { Textarea } from "@/components/Textarea";
import GenericCombobox from "@/components/GenericCombobox";
import { FieldType, FormFragment } from "@/lib/graphql/generated/graphql";
import { Control, UseFormSetError, UseFormSetValue } from "react-hook-form";

interface RegistrationFormFieldsProps {
  fields: FormFragment["fields"];
  canEdit: boolean;
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  setError: UseFormSetError<any>;
  existingAnswers?: Record<string, string | string[]>;
  lng: string;
}

export default function RegistrationFormFields({
  fields,
  canEdit,
  control,
  setValue,
  setError,
  existingAnswers,
  lng,
}: RegistrationFormFieldsProps) {
  return (
    <div className="space-y-6">
      {fields.map((field) => {
        const fieldName = `field_${field.id}`;

        switch (field.type) {
          case FieldType.Text:
            return (
              <Input
                key={field.id}
                name={fieldName}
                label={field.label}
                placeholder={field.placeholder ?? undefined}
                disabled={!canEdit}
              />
            );

          case FieldType.Textarea:
            return (
              <Textarea
                key={field.id}
                name={fieldName}
                label={field.label}
                placeholder={field.placeholder ?? undefined}
                disabled={!canEdit}
              />
            );

          case FieldType.Select:
            return (
              <GenericCombobox<
                {
                  id: number;
                  val: { value: string; text: string };
                },
                string
              >
                key={field.id}
                lng={lng}
                name={fieldName}
                label={field.label}
                control={control}
                defaultOptions={
                  field.selectOptions?.map((opt, i) => ({
                    id: i,
                    val: opt,
                  })) ?? []
                }
                placeholder={field.placeholder ?? ""}
                immediate
                getOptionValue={(opt) => opt?.val.value ?? ""}
                getOptionLabel={(opt) => opt.val.text}
                renderOption={(option, props) => (
                  <p
                    className={
                      props.focus
                        ? "text-white bg-primary-500 dark:bg-primary-300 dark:text-white/80 w-full p-2"
                        : "p-2"
                    }
                  >
                    {option.val.text}
                  </p>
                )}
                disabled={!canEdit}
              />
            );

          case FieldType.FileUpload:
            return (
              <MultipleFileUploadField
                key={field.id}
                name={fieldName}
                label={field.label}
                control={control}
                setValue={setValue}
                setError={setError}
                maxFiles={field.maxFiles ?? undefined}
                fileSources={{
                  courses: existingAnswers?.[field.id],
                }}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
