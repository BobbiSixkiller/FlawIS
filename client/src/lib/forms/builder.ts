import {
  FieldType,
  type FormFieldInput,
  type FormFragment,
} from "@/lib/graphql/generated/graphql";
import sk from "@/lib/i18n/locales/sk/form-builder.json";
import en from "@/lib/i18n/locales/en/form-builder.json";

export const builderMessages = (lng: string) => (lng === "en" ? en : sk);
export const fieldTypes = [
  FieldType.Text,
  FieldType.Textarea,
  FieldType.Select,
  FieldType.RadioGroup,
  FieldType.FileUpload,
];
export const isChoiceField = (type: FieldType) =>
  type === FieldType.Select || type === FieldType.RadioGroup;

/** Creates a persisted question identifier once, independently of RHF row keys. */
export const newFieldId = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(12)), (n) =>
    n.toString(16).padStart(2, "0"),
  ).join("");

/** Defaults only newly added fields; existing upload limits are preserved. */
export function newFormField(type: FieldType): FormFieldInput {
  return {
    id: newFieldId(),
    type,
    label: "",
    required: false,
    placeholder: "",
    helpText: "",
    selectOptions: isChoiceField(type) ? [{ value: "", text: "" }] : null,
    minFiles: type === FieldType.FileUpload ? 0 : null,
    maxFiles: type === FieldType.FileUpload ? 10 : null,
  };
}

/** Copies the public form contract into an editable draft without GraphQL metadata. */
export function editableFormFields(form: FormFragment): FormFieldInput[] {
  return form.fields.map(
    ({
      id,
      type,
      label,
      required,
      placeholder,
      helpText,
      selectOptions,
      minFiles,
      maxFiles,
    }) => ({
      id,
      type,
      label,
      required,
      placeholder,
      helpText,
      selectOptions:
        selectOptions?.map(({ value, text }) => ({ value, text })) ?? null,
      minFiles:
        type === FieldType.FileUpload
          ? (minFiles ?? (required ? 1 : 0))
          : minFiles,
      maxFiles: type === FieldType.FileUpload ? (maxFiles ?? 10) : maxFiles,
    }),
  );
}
