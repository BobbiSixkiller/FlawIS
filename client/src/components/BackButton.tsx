"use client";

import Icon from "@/components/Icon";
import { useRouter } from "next/navigation";

import Button from "@/components/Button";

export default function BackButton({
  fallbackHref,
  label,
}: {
  fallbackHref: string;
  label: string;
}) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="rounded-md"
      onClick={goBack}
      aria-label={label}
    >
      <Icon name="chevron-left" className="size-4" aria-hidden="true" />
      {label}
    </Button>
  );
}
