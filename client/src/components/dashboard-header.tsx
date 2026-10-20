"use client";
import type { ReactNode } from "react";
import Breadcrumbs from "./breadcrumbs";
import Icon from "./icon";
import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
export default function DashboardHeader({
  actions,
  navigationLabel,
}: {
  actions: ReactNode;
  navigationLabel: string;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 min-w-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6">
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
