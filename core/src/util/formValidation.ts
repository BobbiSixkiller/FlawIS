import { GraphQLError } from "graphql";
import { FieldType, FormField } from "../entitites/Form";

export function validateAnswers(
  fields: FormField[],
  answers: Record<string, unknown>,
  submitted: boolean,
) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers))
    throw new Error("Invalid answers.");
  const known = new Set(fields.map((f) => String(f.id)));
  for (const key of Object.keys(answers))
    if (!known.has(key)) throw new Error(`Unknown field: ${key}`);
  const result: Record<string, string | string[]> = {};
  for (const field of fields) {
    const id = String(field.id);
    const value = answers[id];
    function invalid(message: string): never {
      throw new GraphQLError(message, {
        extensions: {
          code: "VALIDATION_FAILED",
          fieldErrors: { [id]: message },
        },
      });
    };
    const empty =
      value == null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);
    if (empty) {
      if (submitted && field.required)
        invalid(`Required field: ${field.label}`);
      continue;
    }
    if (field.type === FieldType.FileUpload) {
      if (
        !Array.isArray(value) ||
        value.some((v) => typeof v !== "string") ||
        value.length > (field.maxFiles ?? 10) ||
        (submitted && value.length < (field.minFiles ?? 1))
      )
        invalid(`Invalid files: ${field.label}`);
      result[id] = value;
    } else {
      if (typeof value !== "string" || value.length > 20000)
        invalid(`Invalid answer: ${field.label}`);
      if (
        [FieldType.Select, FieldType.RadioGroup].includes(field.type) &&
        !field.selectOptions?.some((o) => o.value === value)
      )
        invalid(`Invalid choice: ${field.label}`);
      result[id] = value.trim();
      if (submitted && field.required && !result[id])
        invalid(`Required field: ${field.label}`);
    }
  }
  return result;
}
