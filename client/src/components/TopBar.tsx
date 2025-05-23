"use client";

import { cn } from "@/utils/helpers";
import Breadcrumbs from "./Breadcrumbs";
import {
  Bars3Icon,
  ChevronRightIcon,
  HomeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { ReactNode, useState } from "react";
import useScroll from "@/hooks/useScroll";
import Drawer from "./Drawer";
import Dropdown from "./Dropdown";
import { useTranslation } from "@/lib/i18n/client";
import { useParams } from "next/navigation";
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

  return (
    <div
      className={cn([
        "flex items-center p-4 border-b h-[60px] sticky top-0 z-10 bg-white",
        "dark:border-gray-700 dark:bg-gray-900",
        scrolled ? "shadow-md" : "",
      ])}
    >
      <button
        type="button"
        onClick={() => setVisible(true)}
        className="md:hidden absolute left-2 p-2 rounded-md text-gray-400 hover:bg-gray-300 outline-none focus:ring-2 focus:ring-primary-500 ring-inset"
      >
        <Bars3Icon className="size-5" />
      </button>

      <div className="mx-auto md:hidden">{logo}</div>

      <Breadcrumbs
        homeElement={<HomeIcon className="h-5 w-5" />}
        separator={<ChevronRightIcon className="h-3 w-3" />}
        activeClasses="text-primary-500 hover:underline"
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
              className="rounded-full flex items-center bg-primary-400"
            >
              {avatar}
            </Button>
          }
          items={[
            {
              href: "/profile",
              icon: <UserCircleIcon className="size-5" aria-hidden="true" />,
              text: t("profile"),
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
