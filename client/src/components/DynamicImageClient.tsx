"use client";

import Image, { ImageProps } from "next/image";
import { cn } from "@/utils/helpers";
import { useState } from "react";

export default function DynamicImageClient({
  src,
  alt,
  className,
  ...props
}: {
  src: string;
  alt?: string;
} & ImageProps) {
  const [loading, setLoading] = useState(true);

  return (
    <div
      className={cn(
        `relative ${loading ? "bg-slate-200 animate-pulse" : ""}`,
        className
      )}
    >
      <Image
        {...props}
        src={src}
        alt={alt}
        onLoad={() => setLoading(false)}
        className={cn(
          className,
          `transition-opacity ease-in delay-100 ${
            loading ? "opacity-0" : "opacity-100"
          }`
        )}
        priority
      />
    </div>
  );
}
