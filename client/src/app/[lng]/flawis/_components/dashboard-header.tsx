"use client";
import type { ReactNode } from "react";
import { useWindowScroll } from "@uidotdev/usehooks";
import { cn } from "@/lib/utilsClient";
import Breadcrumbs from "@/components/breadcrumbs";
import Icon from "@/components/icon";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
export default function DashboardHeader({
  actions,
  navigationLabel,
}: {
  actions: ReactNode;
  navigationLabel: string;
}) {
  const [{ y }] = useWindowScroll();

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-16 min-w-0 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14 sm:px-6",
        (y ?? 0) > 0 && "shadow-bottom",
      )}
    >
      <SidebarTrigger
        aria-label={navigationLabel}
        className="size-10 shrink-0"
      />
      <Separator
        orientation="vertical"
        className="h-5 data-vertical:self-center"
      />
      <Breadcrumbs homeElement={<Icon name="home" className="size-4" />} />
      <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>
    </header>
  );
}
