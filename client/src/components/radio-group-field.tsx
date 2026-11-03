"use client";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import type { AriaAttributes, Ref } from "react";
export interface RadioGroupProps extends AriaAttributes {
  id?: string;
  name?: string;
  value?: string | null;
  onChange: (value: string) => void;
  onBlur?: () => void;
  ref?: Ref<HTMLElement>;
  disabled?: boolean;
  options: { value: string; text: string }[];
}
export default function RadioGroupField({
  value,
  options,
  disabled,
  ref,
  onChange,
  ...props
}: RadioGroupProps) {
  return (
    <RadioGroup
      {...props}
      value={value ?? ""}
      disabled={disabled}
      onValueChange={(value) => onChange(String(value))}
      className="gap-1"
    >
      {options.map((option, index) => (
        <label
          key={option.value}
          className="flex min-h-10 cursor-pointer items-center gap-3 text-sm has-disabled:cursor-not-allowed has-disabled:opacity-50"
        >
          <RadioGroupItem
            ref={index === 0 ? ref : undefined}
            value={option.value}
          />
          {option.text}
        </label>
      ))}
    </RadioGroup>
  );
}
