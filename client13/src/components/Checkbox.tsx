"use client";

import { useFormContext } from "react-hook-form";

export default function CheckBox({
  name,
  label,
}: {
  name: string;
  label: string;
}) {
  const { register, getFieldState } = useFormContext();
  const { error } = getFieldState(name);

  return (
    <div>
      <div className="flex items-center gap-x-3">
        <input
          {...register(name)}
          type="checkbox"
          className="h-4 w-4 border-gray-300 text-primary-500 focus:ring-primary-500 rounded-md"
        />
        <label
          htmlFor={name}
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {label}
        </label>
      </div>
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
}
