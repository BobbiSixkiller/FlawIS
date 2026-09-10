import type { TFunction } from "i18next";
import { z } from "zod";

export function validation(t: TFunction<"validation">) {
  return {
    string: () => z.string({ error: t("required") }),
    number: () => z.number({ error: t("number") }),
    date: () => z.date({ error: t("date") }),
    required: t("required"),
    email: t("email"),
    url: t("url"),
    min: (value: number) => t("min", { value }),
    max: (value: number) => t("max", { value }),
  };
}

/** Attach a cross-field issue without waiting for unrelated fields to be valid. */
export function compareFields<
  S extends z.ZodRawShape,
  K extends keyof S & string,
>(
  schema: z.ZodObject<S>,
  path: K,
  other: K,
  compare: (value: z.output<S[K]>, other: z.output<S[K]>) => boolean,
  message: string,
) {
  return schema.refine(
    (value) =>
      compare(
        (value as Record<K, z.output<S[K]>>)[path],
        (value as Record<K, z.output<S[K]>>)[other],
      ),
    {
      path: [path],
      message,
      when: ({ value }) =>
        z
          .object({ [path]: schema.shape[path], [other]: schema.shape[other] })
          .safeParse(value).success,
    },
  );
}
