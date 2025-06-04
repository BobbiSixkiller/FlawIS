"use client";

import { cn } from "@/utils/helpers";
import Breadcrumbs from "./Breadcrumbs";
import {
  ArrowLeftStartOnRectangleIcon,
  Bars3Icon,
  ChevronRightIcon,
  HomeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { ReactNode, useEffect, useState } from "react";
import useScroll from "@/hooks/useScroll";
import Drawer from "./Drawer";
import Dropdown from "./Dropdown";
import { useTranslation } from "@/lib/i18n/client";
import { useParams, usePathname } from "next/navigation";
import Button from "./Button";

export default function TopBar({
  avatar,
  search,
  drawerTitle,
  drawerContent,
  logo,
}: {
  avatar: ReactNode;
  search: ReactNode;
  drawerTitle: ReactNode;
  drawerContent: ReactNode;
  logo: ReactNode;
}) {
  const scrolled = useScroll();
  const [visible, setVisible] = useState(false);
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "dashboard");
  const path = usePathname();

  useEffect(() => {
    setVisible(false);
  }, [path]);

  return (
    <div
      className={cn([
        "flex items-center p-4 border-b h-[60px] sticky top-0 z-10 bg-white",
        "dark:border-gray-700 dark:bg-gray-900",
        scrolled ? "shadow-md" : "",
      ])}
    >
      <Button
        onClick={() => setVisible(true)}
        className="md:hidden absolute left-2 p-2 w-fit"
        variant="ghost"
      >
        <Bars3Icon className="size-5" />
      </Button>

      <div className="mx-auto md:hidden">{logo}</div>

      <Breadcrumbs
        homeElement={<HomeIcon className="h-5 w-5" />}
        separator={<ChevronRightIcon className="h-3 w-3" />}
        activeClasses="text-primary-500 dark:text-primary-300 hover:underline"
        containerClasses="hidden md:flex flex-wrap text-sm gap-2 items-center dark:text-white/85"
        listClasses="outline-none focus:ring-2 focus:ring-primary-500"
        capitalizeLinks
      />
      <div className="absolute right-4 flex items-center gap-2">
        {search}

        <Dropdown
          trigger={
            <Button
              size="icon"
              className="rounded-full flex items-center w-fit h-fit"
            >
              {avatar}
            </Button>
          }
          items={[
            {
              type: "link",
              href: "/profile",
              icon: <UserCircleIcon className="size-5" aria-hidden="true" />,
              text: t("profile"),
            },
            {
              type: "link",
              href: "/logout",
              icon: (
                <ArrowLeftStartOnRectangleIcon
                  className="size-5"
                  aria-hidden="true"
                />
              ),
              text: t("logout"),
            },
          ]}
        />
      </div>

      <Drawer
        visible={visible}
        setVisible={setVisible}
        title={drawerTitle}
        toggleStart="left"
      >
        {drawerContent}
      </Drawer>
    </div>
  );
}
