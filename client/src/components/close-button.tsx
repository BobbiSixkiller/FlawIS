import Link from "next/link";
import { Button } from "@/components/ui/button";
import Icon from "@/components/icon";

export default function CloseButton({ href = "/" }: { href?: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full ml-auto"
      nativeButton={false}
      role="link"
      render={<Link href={href} />}
    >
      <Icon name="x-mark" className="size-5" />
    </Button>
  );
}
