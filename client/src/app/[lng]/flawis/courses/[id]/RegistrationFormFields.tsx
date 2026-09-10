"use client";
import type { RegistrationValues } from "@/lib/validation/registration-form-schema";

import { FormField } from "@/components/form";
import { inputChange, inputValue } from "@/components/form-values";

import GenericCombobox from "@/components/GenericCombobox";
import { Input } from "@/components/Input";
import MultipleFileUploadField from "@/components/MultipleFileUploadField";
import RadioGroupField from "@/components/RadioGroupField";
import { Textarea } from "@/components/Textarea";
import { FieldType, FormFragment } from "@/lib/graphql/generated/graphql";

interface RegistrationFormFieldsProps {
  fields: FormFragment["fields"];
  canEdit: boolean;
  existingAnswers?: Record<string, string | string[]>;
  lng: string;
}

export default function RegistrationFormFields({
  fields,
  canEdit,
  existingAnswers,
  lng,
}: RegistrationFormFieldsProps) {
  return (
    <div className="space-y-6">
      {fields.map((definition) => {
        const fieldName = `field_${definition.id}` as const;

        const helpText = definition.helpText ? (
          <div
            className="prose prose-sm dark:prose-invert text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: definition.helpText }}
          />
        ) : null;

        switch (definition.type) {
          case FieldType.Text:
            return (
              <div key={definition.id} className="space-y-2">
                <FormField<RegistrationValues, typeof fieldName>
                  name={fieldName}
                  label={definition.label}
                >
                  {({ field, controlProps }) => (
                    <Input
                      {...field}
                      {...controlProps}
                      placeholder={definition.placeholder ?? undefined}
                      disabled={!canEdit}
                      value={inputValue(field.value, undefined)}
                      onChange={(event) => {
                        field.onChange(inputChange(event));
                      }}
                    />
                  )}
                </FormField>
                {helpText}
              </div>
            );

          case FieldType.Textarea:
            return (
              <div key={definition.id} className="space-y-2">
                <FormField<RegistrationValues, typeof fieldName>
                  name={fieldName}
                  label={definition.label}
                >
                  {({ field, controlProps }) => (
                    <Textarea
                      {...field}
                      {...controlProps}
                      placeholder={definition.placeholder ?? undefined}
                      disabled={!canEdit}
                      value={typeof field.value === "string" ? field.value : ""}
                    />
                  )}
                </FormField>
                {helpText}
              </div>
            );

          case FieldType.Select:
            return (
              <div key={definition.id} className="space-y-2">
                <FormField<RegistrationValues, typeof fieldName>
                  name={fieldName}
                  label={definition.label}
                >
                  {({ field, controlProps, onError, itemErrors }) => (
                    <GenericCombobox<
                      {
                        id: number;
                        val: { value: string; text: string };
                      },
                      string
                    >
                      {...field}
                      {...controlProps}
                      value={typeof field.value === "string" ? field.value : ""}
                      lng={lng}
                      defaultOptions={
                        definition.selectOptions?.map((opt, i) => ({
                          id: i,
                          val: opt,
                        })) ?? []
                      }
                      placeholder={definition.placeholder ?? ""}
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
                      onError={onError}
                      itemErrors={itemErrors}
                    />
                  )}
                </FormField>
                {helpText}
              </div>
            );

          case FieldType.RadioGroup:
            return (
              <div key={definition.id} className="space-y-2">
                <FormField<RegistrationValues, typeof fieldName>
                  name={fieldName}
                  label={definition.label}
                >
                  {({ field, controlProps }) => (
                    <RadioGroupField
                      {...field}
                      {...controlProps}
                      value={typeof field.value === "string" ? field.value : ""}
                      options={definition.selectOptions ?? []}
                      disabled={!canEdit}
                    />
                  )}
                </FormField>
                {helpText}
              </div>
            );

          case FieldType.FileUpload:
            return (
              <div key={definition.id} className="space-y-2">
                <FormField<RegistrationValues, typeof fieldName>
                  name={fieldName}
                  label={definition.label}
                >
                  {({ field, controlProps, initialize, onError }) => (
                    <MultipleFileUploadField
                      {...field}
                      {...controlProps}
                      value={field.value as File[] | undefined}
                      disabled={!canEdit}
                      maxFiles={definition.maxFiles ?? undefined}
                      fileSources={{
                        courses: existingAnswers?.[definition.id],
                      }}
                      onLoad={initialize}
                      onError={onError}
                    />
                  )}
                </FormField>
                {helpText}
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
