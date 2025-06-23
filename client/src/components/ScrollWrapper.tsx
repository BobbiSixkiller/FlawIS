"use client";

import { useScrollStore } from "@/stores/scrollStore";
import { cn } from "@/utils/helpers";
import { ReactNode, useEffect, useRef } from "react";

export default function ScrollWrapper({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const setScroll = useScrollStore((s) => s.setScroll);
  const clearScroll = useScrollStore((s) => s.clearScroll);

  useEffect(() => {
    setScroll(id, () => ref.current?.scrollTo({ top: 0, behavior: "smooth" }));

    return () => clearScroll(id);
  }, [id]);

  return (
    <div ref={ref} className={cn(["overflow-auto h-full w-full", className])}>
      {children}
    </div>
  );
}
