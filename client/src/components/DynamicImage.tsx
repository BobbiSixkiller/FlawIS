import Image from "next/image";
import { getPlaiceholder } from "plaiceholder";
import { cn } from "@/utils/helpers";

async function getImage(src: string) {
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
  url,
  alt,
  containerClass,
}: {
  url: string;
  alt?: string;
  containerClass?: string;
}) {
  const { base64, img } = await getImage(url);

  return (
    <div className={cn("relative", containerClass)}>
      <Image
        {...img}
        alt={alt || ""}
        placeholder="blur"
        blurDataURL={base64}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}
