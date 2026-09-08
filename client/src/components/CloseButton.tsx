import Link from "next/link";
import Button from "./Button";
import Icon from "@/components/Icon";

export default function CloseButton({ href = "/" }: { href?: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      as={Link}
      className="rounded-full ml-auto"
      href={href}
    >
      <Icon name="x-mark" className="size-5" />
    </Button>
  );
}
