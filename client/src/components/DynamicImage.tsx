import Image, { ImageProps } from "next/image";
import { getPlaiceholder } from "plaiceholder";
import { cn } from "@/utils/helpers";

export async function getImage(src: string) {
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
}

export default async function DynamicImage({
  src,
  ...props
}: {
  src: string;
} & ImageProps) {
  const { base64 } = await getImage(src);

  return (
    <div className={cn("relative", props.className)}>
      <Image {...props} src={src} placeholder="blur" blurDataURL={base64} />
    </div>
  );
}
