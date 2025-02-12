"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useController } from "react-hook-form";
import { InputProps, withLocalizedInput } from "./withLocalizedInput";
import Button from "./Button";
import { TrashIcon } from "@heroicons/react/24/outline";

export default function ImageFileInput({
  avatarUrl,
  label,
  name,
  ...props
}: {
  avatarUrl?: string;
} & InputProps) {
  const { field, fieldState } = useController({ name });

  useEffect(() => {
    if (field.value) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(field.value);
    } else {
      setPreview("/images/img-placeholder.jpg");
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
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <label className="cursor-pointer bg-primary-100 px-5 py-1 hover:bg-primary-200 text-primary-600 rounded-full font-semibold">
          {label}
          <input
            {...props}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {field.value && (
          <Button
            variant="destructive"
            type="button"
            className="rounded-full p-2 size-8"
            onClick={() => field.onChange(null)}
          >
            <TrashIcon className="size-5" />
          </Button>
        )}
      </div>
      {fieldState.error && (
        <p className="text-sm text-red-500">{fieldState.error.message}</p>
      )}
    </div>
  );
}

export function LocalizedImageFileInput({
  lng,
  ...props
}: { lng: string } & InputProps) {
  const LocalizedImageFileInput = withLocalizedInput(
    { lng, ...props },
    ImageFileInput
  );

  return <LocalizedImageFileInput />;
}
