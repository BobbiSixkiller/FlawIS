import Link from "next/link";
import Button from "./Button";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function CloseButton({ href = "/" }: { href?: string }) {
  return (
    <Button
      as={Link}
      className="rounded-full bg-transparent h-full p-2 text-gray-900 dark:text-gray-300 dark:hover:bg-gray-600 hover:bg-gray-100 max-w-fit hover:text-gray-400 ml-auto"
      href={href}
    >
      <XMarkIcon className="size-5" />
    </Button>
  );
}
