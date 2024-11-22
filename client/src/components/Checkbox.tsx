"use client";

import { Checkbox, Field, Label } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { useController } from "react-hook-form";

export default function CheckBox({
  name,
  label,
}: {
  name: string;
  label: any;
}) {
  const { field, fieldState } = useController({ name });

  return (
    <div>
      <Field className="flex items-center gap-x-3">
        <Checkbox
          checked={field.value}
          onChange={() => field.onChange(!field.value)}
          className="outline-none shadow-sm group size-5 p-1 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-500 data-[checked]:bg-primary-500 data-[checked]:ring-primary-500 rounded-md"
        >
          <CheckIcon className="hidden size-3 stroke-2 text-white group-data-[checked]:block" />
        </Checkbox>
        <Label className="block text-sm font-medium leading-6 text-gray-900">
          {label}
        </Label>
      </Field>
      {fieldState.error && (
        <p className="text-sm text-red-500">{fieldState.error.message}</p>
      )}
    </div>
  );
}
