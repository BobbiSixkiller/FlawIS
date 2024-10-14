"use client";

import Image, { ImageProps } from "next/image";
import { cn } from "@/utils/helpers";
import { getImage } from "./DynamicImage";
import { useEffect, useState } from "react";

export default function DynamicImageClient({
  url,
  alt,
  containerClass,
  ...props
}: {
  url: string;
  alt?: string;
  containerClass?: string;
} & ImageProps) {
  const [blurImg, setBlurImg] = useState("");

  useEffect(() => {
    async function getBlurImg() {
      const { base64 } = await getImage(url);
      setBlurImg(base64);
    }

    getBlurImg();
  }, []);

  return (
    <div className={cn("relative", containerClass)}>
      <Image alt={alt} {...props} placeholder="blur" blurDataURL={blurImg} />
    </div>
  );
}
