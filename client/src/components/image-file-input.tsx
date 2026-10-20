"use client";

import Icon from "@/components/icon";
import { type ComponentPropsWithRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useFileSource } from "./use-file-source";
import { useObjectURL } from "./use-object-url";

interface ImageFileInputProps
  extends Omit<
    ComponentPropsWithRef<"input">,
    "value" | "onChange" | "onLoad" | "onError"
  > {
  value?: File | null;
  onChange: (file: File | null) => void;
  onLoad?: (file: File | null) => void;
  onError?: (message: string) => void;
  avatarUrl?: string;
  bucket?: string;
  buttonLabel?: ReactNode;
}
export default function ImageFileInput({
  value,
  onChange,
  onLoad = onChange,
  onError,
  avatarUrl,
  bucket = "avatars",
  buttonLabel,
  ref,
  ...props
}: ImageFileInputProps) {
  const preview = useObjectURL(value);
  const loading = useFileSource({
    value,
    sources: { [bucket]: avatarUrl },
    onLoad,
    onError,
    convert: (files) => files[0] ?? null,
  });
  return (
    <div className="flex gap-4 items-center">
      <div className="size-16 rounded-full relative">
        {/* Object URLs are local file previews and cannot use image optimization. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            preview ??
            (value === undefined ? avatarUrl : undefined) ??
            "/images/img-placeholder.jpg"
          }
          alt=""
          width={64}
          height={64}
          style={{ objectFit: "cover" }}
          className="size-full rounded-full object-cover"
        />
      </div>
      <label className="cursor-pointer bg-accent px-5 py-1 hover:bg-primary-200 text-primary rounded-full font-semibold">
        {buttonLabel}
        <input
          {...props}
          ref={ref}
          disabled={props.disabled || loading}
          type="file"
          accept="image/*"
          onChange={(event) => {
            onChange(event.target.files?.[0] ?? null);
            event.target.value = "";
          }}
          className="sr-only"
        />
      </label>
      {value && (
        <Button
          disabled={props.disabled}
          variant="destructive"
          type="button"
          className="rounded-full p-2 size-8"
          aria-label="Remove image"
          onClick={() => onChange(null)}
        >
          <Icon name="trash" className="size-5" />
        </Button>
      )}
    </div>
  );
}
