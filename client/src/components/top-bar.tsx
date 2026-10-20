"use client";

import { cn } from "@/lib/utilsClient";
import Breadcrumbs from "./breadcrumbs";
import Icon from "./icon";
import { ReactNode, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { useTranslation } from "@/lib/i18n/client";
import { useParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWindowScroll } from "@uidotdev/usehooks";

export default function TopBar({
  logo,
  actions,
  drawer,
  contentClassName = "container",
}: {
  logo: ReactNode;
  actions: ReactNode;
  drawer?: { title: ReactNode; content: ReactNode };
  contentClassName?: string;
}) {
  const [{ y }] = useWindowScroll();
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "dashboard");
  const path = usePathname();
  const [drawerState, setDrawerState] = useState({ path, visible: false });

  if (drawerState.path !== path) {
    setDrawerState({ path, visible: false });
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-20 h-16 w-full shrink-0 border-b bg-background/95 backdrop-blur-sm",
        (y ?? 0) > 0 && "shadow-bottom",
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-full w-full min-w-0 items-center gap-2 px-4",
          contentClassName,
        )}
      >
        {drawer && (
          <Button
            onClick={() => setDrawerState({ path, visible: true })}
            aria-label={t("openNavigation")}
            aria-expanded={drawerState.visible}
            className="shrink-0 rounded-full lg:hidden"
            variant="ghost"
            size="icon"
          >
            <Icon name="bars3" className="size-5" />
          </Button>
        )}
        <Breadcrumbs
          homeElement={drawer ? <Icon name="home" className="size-5" /> : logo}
        />
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {actions}
        </div>
        {drawer && (
          <Sheet
            open={drawerState.visible}
            onOpenChange={(visible) => setDrawerState({ path, visible })}
          >
            <SheetContent
              side="left"
              className="gap-6 overflow-y-auto bg-sidebar p-6 text-sidebar-foreground sm:max-w-sm"
            >
              <SheetHeader className="p-0">
                <SheetTitle className="pr-8">{drawer.title}</SheetTitle>
              </SheetHeader>
              <div className="flex flex-1 flex-col gap-2">{drawer.content}</div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </header>
  );
}
