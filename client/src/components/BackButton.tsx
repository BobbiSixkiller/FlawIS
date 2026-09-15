"use client";

import Icon from "@/components/Icon";
import useMounted from "@/hooks/useMounted";
import { useRouter } from "next/navigation";

import Button from "@/components/Button";

export default function BackButton({ label }: { label: string }) {
  const router = useRouter();
  const mounted = useMounted();

  if (!mounted || window.history.length <= 1) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full lg:w-auto lg:px-3"
      onClick={() => router.back()}
      aria-label={label}
    >
      <Icon name="chevron-left" className="size-4" aria-hidden="true" />
      <span className="hidden lg:inline">{label}</span>
    </Button>
  );
}
