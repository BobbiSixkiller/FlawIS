"use client";
import type { AriaAttributes, Ref } from "react";
import {
  Select as SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
interface Option<T> {
  name: string;
  value: T;
}
export interface SelectProps<T> extends AriaAttributes {
  disabled?: boolean;
  placeholder?: string;
  name?: string;
  id?: string;
  options: Option<T>[];
  multiple?: boolean;
  value?: T | T[] | null;
  onChange: (value: T | T[]) => void;
  onBlur?: () => void;
  ref?: Ref<HTMLButtonElement>;
}
export default function Select<T>({
  placeholder,
  name,
  options,
  disabled,
  multiple = false,
  value,
  onChange,
  ref,
  ...props
}: SelectProps<T>) {
  return (
    <SelectRoot<T, boolean>
      name={name}
      disabled={disabled}
      multiple={multiple}
      items={options.map((option) => ({
        label: option.name,
        value: option.value,
      }))}
      value={value ?? (multiple ? [] : null)}
      onValueChange={(next) => {
        if (next !== null) onChange(next);
      }}
    >
      <SelectTrigger {...props} ref={ref} className="h-10 w-full bg-background">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {options.map((option, index) => (
          <SelectItem key={index} value={option.value} className="min-h-9">
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
}
