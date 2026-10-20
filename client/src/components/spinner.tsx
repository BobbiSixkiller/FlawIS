import Icon from "@/components/icon";
import { cn } from "@/lib/utilsClient";

const sizeMap = {
  sm: "size-3",
  md: "size-6",
} as const;

type SpinnerSize = keyof typeof sizeMap;

export default function Spinner({
  inverted = false,
  size = "md",
  className,
}: {
  inverted?: boolean;
  size?: SpinnerSize;
  className?: string;
}) {
  return (
    <div aria-label="Loading..." role="status" className={className}>
      <Icon
        name="spinner"
        className={cn([
          "animate-spin",
          sizeMap[size],
          inverted ? "fill-primary-foreground" : "fill-foreground",
        ])}
      />
    </div>
  );
}
