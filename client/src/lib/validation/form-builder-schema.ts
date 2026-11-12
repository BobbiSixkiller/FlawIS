import { z } from "zod";
import { FieldType } from "@/lib/graphql/generated/graphql";
import { builderMessages, isChoiceField } from "@/lib/forms/builder";

/** Shared editor validation; the host decides whether an empty form is allowed. */
export function createFormFieldsSchema(lng: string, minimum = 0) {
  const t = builderMessages(lng);
  const field = z
    .object({
      id: z
        .string()
        .regex(/^[a-f\d]{24}$/i)
        .nullish(),
      type: z.enum(FieldType, { error: t.invalidType }),
      label: z
        .string()
        .trim()
        .min(1, t.requiredLabel)
        .max(200, t.requiredLabel),
      required: z.boolean(),
      placeholder: z.string().max(300, t.placeholderError).nullish(),
      helpText: z.string().max(5000, t.helpError).nullish(),
      selectOptions: z
        .array(
          z.object({
            value: z
              .string()
              .max(200, t.requiredOption)
              .refine((value) => value.trim().length > 0, t.requiredOption),
            text: z
              .string()
              .trim()
              .min(1, t.requiredOption)
              .max(200, t.requiredOption),
          }),
        )
        .nullish(),
      minFiles: z.number({ error: t.minFilesError }).nullish(),
      maxFiles: z.number({ error: t.maxFilesError }).nullish(),
    })
    .superRefine((field, ctx) => {
      if (isChoiceField(field.type)) {
        if (!field.selectOptions?.length || field.selectOptions.length > 100)
          ctx.addIssue({
            code: "custom",
            path: ["selectOptions"],
            message: t.optionsRequired,
          });
        const seen = new Set<string>();
        field.selectOptions?.forEach((option, index) => {
          if (seen.has(option.value))
            ctx.addIssue({
              code: "custom",
              path: ["selectOptions", index, "value"],
              message: t.duplicateOption,
            });
          seen.add(option.value);
        });
      }
      if (field.type === FieldType.FileUpload) {
        const min = field.minFiles ?? (field.required ? 1 : 0),
          max = field.maxFiles ?? 10;
        if (
          !Number.isInteger(min) ||
          min < (field.required ? 1 : 0) ||
          min > 20
        )
          ctx.addIssue({
            code: "custom",
            path: ["minFiles"],
            message: t.minFilesError,
          });
        if (!Number.isInteger(max) || max < 1 || max > 20 || max < min)
          ctx.addIssue({
            code: "custom",
            path: ["maxFiles"],
            message: t.maxFilesError,
          });
      }
    });
  return z
    .array(field)
    .min(minimum, t.addField)
    .max(100, t.maxFields)
    .superRefine((fields, ctx) => {
      const ids = fields.flatMap((f) => (f.id ? [f.id] : []));
      if (new Set(ids).size !== ids.length)
        ctx.addIssue({ code: "custom", message: t.duplicateField });
    });
}
