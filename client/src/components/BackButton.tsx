"use client";

import { ChevronLeftIcon } from "@heroicons/react/24/outline";
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
      className="ml-auto rounded-full"
      onClick={goBack}
      aria-label={label}
    >
      <ChevronLeftIcon className="size-4" aria-hidden="true" />
      {label}
    </Button>
  );
}
