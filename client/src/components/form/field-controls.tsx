"use client";
import { type AriaAttributes, type ReactNode, type Ref, useId } from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
export function FieldControl({
  label,
  hint,
  error,
  fieldId,
  children,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  fieldId?: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <Field data-invalid={Boolean(error)} data-form-field={fieldId}>
      <FieldLabel id={`${id}-label`} htmlFor={id}>
        {label}
      </FieldLabel>
      <div className="[&>[data-slot=native-select-wrapper]]:w-full">
        {children(id)}
      </div>
      {hint && <FieldDescription id={`${id}-hint`}>{hint}</FieldDescription>}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  );
}
export function ErrorAlert({ message }: { message: string }) {
  return message ? (
    <Alert variant="destructive">
      <AlertDescription>
        <FieldError>{message}</FieldError>
      </AlertDescription>
    </Alert>
  ) : null;
}
export function SelectControl({
  id,
  value,
  onChange,
  options,
  empty = "—",
  disabled,
  ref,
  ...aria
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  empty?: string;
  disabled?: boolean;
  ref?: Ref<HTMLSelectElement>;
} & AriaAttributes) {
  return (
    <NativeSelect
      ref={ref}
      {...aria}
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      <NativeSelectOption value="">{empty}</NativeSelectOption>
      {options.map((o) => (
        <NativeSelectOption key={o.value} value={o.value}>
          {o.label}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}
