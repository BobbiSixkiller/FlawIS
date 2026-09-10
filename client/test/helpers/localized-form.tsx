import type { FieldErrors } from "react-hook-form";
import { z } from "zod";
import { FormContainer, LocalizedFormField } from "../../src/components/form";
import { Textarea } from "../../src/components/Textarea";

const translation = z.object({ name: z.string() });
const schema = z.object({
  submission: z.object({
    translations: z.object({ sk: translation, en: translation }),
  }),
});
export type LocalizedValues = z.input<typeof schema>;
export function LocalizedTestForm({
  errors,
}: {
  errors?: FieldErrors<LocalizedValues>;
}) {
  return (
    <FormContainer
      schema={schema}
      errors={errors}
      defaultValues={{
        submission: {
          translations: {
            sk: { name: "Slovenský názov" },
            en: { name: "English title" },
          },
        },
      }}
    >
      {() => (
        <LocalizedFormField<
          LocalizedValues,
          "submission.translations.sk.name" | "submission.translations.en.name"
        >
          lng="sk"
          name="submission.translations.sk.name"
          label="Názov"
        >
          {({ field, controlProps }) => (
            <Textarea {...field} {...controlProps} />
          )}
        </LocalizedFormField>
      )}
    </FormContainer>
  );
}
