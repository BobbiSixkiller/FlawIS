import type { TFunction } from "i18next";
import { z } from "zod";
import { validation } from "./form-validation";
import { FieldType, type FormFragment } from "../graphql/generated/graphql";

export type RegistrationValues = {
  [key: `field_${string}`]: string | string[] | File[] | undefined;
};
export function createRegistrationSchema(
  fields: FormFragment["fields"],
  t: TFunction<"validation">,
  validate = true,
) {
  const v = validation(t);
  const shape: Record<
    `field_${string}`,
    z.ZodType<
      string | string[] | File[] | undefined,
      string | string[] | File[] | undefined
    >
  > = {};
  for (const field of fields) {
    const name = `field_${field.id}` as const;
    if (!validate) {
      shape[name] = z
        .union([z.string(), z.array(z.string()), z.array(z.file())])
        .optional();
    } else if (field.type === FieldType.FileUpload) {
      const files = z
        .array(z.file({ error: v.required }))
        .min(field.minFiles ?? 1, t("minFiles", { value: field.minFiles ?? 1 }))
        .max(
          field.maxFiles ?? 10,
          t("maxFiles", { value: field.maxFiles ?? 10 }),
        );
      shape[name] = field.required ? files : files.optional();
    } else {
      shape[name] = field.required
        ? v.string().trim().min(1, v.required)
        : v.string().trim().optional();
    }
  }
  return z.object(shape);
}
