"use client";

import { cn } from "@/lib/utilsClient";
import Breadcrumbs from "./Breadcrumbs";
import Icon from "./Icon";
import { ReactNode, useState } from "react";
import Drawer from "./Drawer";
import { useTranslation } from "@/lib/i18n/client";
import { useParams, usePathname } from "next/navigation";
import Button from "./Button";
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
        "sticky top-0 z-20 h-15 w-full shrink-0 border-b bg-white dark:border-gray-700 dark:bg-gray-900",
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
          <Drawer
            visible={drawerState.visible}
            setVisible={(visible) => setDrawerState({ path, visible })}
            title={drawer.title}
            toggleStart="left"
          >
            {drawer.content}
          </Drawer>
        )}
      </div>
    </header>
  );
}
