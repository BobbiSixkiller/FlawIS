import Image, { ImageProps } from "next/image";
import { getPlaiceholder } from "plaiceholder";
import { cn } from "@/utils/helpers";
import { readFile } from "node:fs/promises";

const FALLBACK_SRC = "/images/img-placeholder.jpg";

export async function getImage(src: string) {
  try {
    const buffer = await fetch(src).then(async (res) =>
      Buffer.from(await res.arrayBuffer())
    );

    const {
      metadata: { height, width },
      ...plaiceholder
    } = await getPlaiceholder(buffer, { size: 10 });

    return {
      ...plaiceholder,
      img: { src, height, width },
    };
  } catch (error) {
    console.error(
      `Failed to fetch image from ${src}. Falling back to default image.`,
      error
    );
    const file = await readFile(process.cwd() + "/public" + FALLBACK_SRC);

    const {
      metadata: { height, width },
      ...plaiceholder
    } = await getPlaiceholder(file, { size: 10 });

    return {
      ...plaiceholder,
      img: { src: FALLBACK_SRC, height, width },
    };
  }
}

export default async function DynamicImage({
  src,
  alt,
  ...props
}: {
  src: string;
} & ImageProps) {
  const { base64, img } = await getImage(src);

  return (
    <div className={cn("relative", props.className)}>
      <Image
        {...props}
        src={img.src}
        alt={alt}
        placeholder="blur"
        blurDataURL={base64}
      />
    </div>
  );
}
