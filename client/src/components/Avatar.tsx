import { UserFragment } from "@/lib/graphql/generated/graphql";
import DynamicImage from "./DynamicImage";

export default function Avatar({
  name,
  avatarUrlEnv,
}: Pick<UserFragment, "name" | "avatarUrlEnv">) {
  return avatarUrlEnv ? (
    <DynamicImage
      src={avatarUrlEnv}
      alt="Avatar"
      className="size-9 rounded-full"
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      style={{ objectFit: "cover" }}
    />
  ) : (
    <div className="size-9 rounded-full flex justify-center items-center bg-primary-400 text-white/85">
      {name
        .split(" ")
        .map((n, i) => {
          if (i < 2) return n[0].toUpperCase();
        })
        .join("")}
    </div>
  );
}
