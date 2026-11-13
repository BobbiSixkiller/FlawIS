import { FieldType } from "../../entitites/Form";

// JSONObject bypasses GraphQL's enum serializer. Keep review questionnaires on
// the same wire format as the typed form library and settings queries.
export function reviewFormView<T extends { fields: { type: FieldType }[] }>(
  form: T,
) {
  const names = new Map(
    Object.entries(FieldType).map(([name, value]) => [value, name]),
  );
  return {
    ...form,
    fields: form.fields.map((field) => ({
      ...field,
      type: names.get(field.type)!,
    })),
  } as Omit<T, "fields"> & {
    fields: (Omit<T["fields"][number], "type"> & {
      type: keyof typeof FieldType;
    })[];
  };
}
