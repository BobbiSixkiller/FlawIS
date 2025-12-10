import { UserFragment } from "@/lib/graphql/generated/graphql";
import DynamicImage from "./DynamicImage";
import { cn } from "@/utils/helpers";

const sizeMap = {
  regular: "size-9",
  large: "size-12",
};

type SizeType = keyof typeof sizeMap;

export default function Avatar({
  name,
  avatarUrl,
  size = "regular",
}: Pick<UserFragment, "name" | "avatarUrl"> & { size?: SizeType }) {
  return avatarUrl ? (
    <DynamicImage
      src={avatarUrl}
      alt="Avatar"
      className={cn("rounded-full flex-none", sizeMap[size])}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      style={{ objectFit: "cover" }}
    />
  ) : (
    <div
      className={cn([
        "rounded-full flex-none flex justify-center items-center bg-primary-400 text-white/85",
        sizeMap[size],
      ])}
    >
      {name
        .split(" ")
        .map((n, i) => {
          if (i < 2) return n[0].toUpperCase();
        })
        .join("")}
    </div>
  );
}
