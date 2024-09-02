"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import { InputProps, withLocalizedInput } from "./withLocalizedInput";

export default function FileInput({
  avatarUrl,
  label,
  name,
  ...props
}: {
  avatarUrl?: string;
  label: string;
  name: string;
} & InputProps) {
  //   const { setValue, watch } = useFormContext();
  //   const value = watch(name);

  const { field, fieldState } = useController({ name });

  useEffect(() => {
    if (field.value) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(field.value);
    }
  }, [field.value]);

  const [preview, setPreview] = useState<string>(
    avatarUrl || "/images/img-placeholder.jpg"
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      //   setValue(name, file);
      field.onChange(file);
    }
  };

  return (
    <div>
      <div className="flex gap-4 items-center">
        <div className="w-16 h-16 rounded-full relative">
          <Image
            src={preview}
            alt="Picture of the property"
            fill
            style={{ objectFit: "cover" }}
            className="rounded-full"
          />
        </div>
        <label className="bg-primary-100 px-5 py-1 hover:bg-primary-200 text-primary-600 rounded-full font-semibold">
          {label}
          <input
            {...props}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
      {fieldState.error && (
        <p className="text-sm text-red-500">{fieldState.error.message}</p>
      )}
    </div>
  );
}

export function LocalizedFileInput({
  lng,
  ...props
}: { lng: string } & InputProps) {
  const LocalizedFileInput = withLocalizedInput({ lng, ...props }, FileInput);

  return <LocalizedFileInput />;
}
