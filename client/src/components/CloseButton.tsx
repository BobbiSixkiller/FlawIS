import Link from "next/link";
import Button from "./Button";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function CloseButton({ href = "/" }: { href?: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      as={Link}
      className="rounded-full ml-auto"
      href={href}
    >
      <XMarkIcon className="size-5" />
    </Button>
  );
}
