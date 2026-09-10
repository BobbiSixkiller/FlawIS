import { formatDatetimeLocal } from "@/lib/utilsClient";
import type { ChangeEvent } from "react";

/** Native inputs use strings; form state keeps numbers and dates. */
export function inputValue(value: unknown, type?: string): string | number {
  if (type === "date" || type === "datetime-local") {
    return formatDatetimeLocal(
      value as Date | string | null | undefined,
      type === "datetime-local",
    );
  }
  return typeof value === "number"
    ? Number.isNaN(value)
      ? ""
      : value
    : typeof value === "string"
      ? value
      : "";
}

export function inputChange(
  event: ChangeEvent<HTMLInputElement>,
  normalize?: (value: string) => string,
) {
  const input = event.currentTarget;
  if (input.type === "number")
    return input.value === "" ? null : input.valueAsNumber;
  if (input.type === "datetime-local") {
    if (!input.value) return null;
    const [year, month, day, hour, minute] = input.value
      .split(/[-T:]/)
      .map(Number);
    return new Date(year, month - 1, day, hour, minute);
  }
  if (input.type === "date") return input.valueAsDate;
  return normalize ? normalize(input.value) : input.value;
}
