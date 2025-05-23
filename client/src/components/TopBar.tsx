"use client";

import { cn } from "@/utils/helpers";
import Breadcrumbs from "./Breadcrumbs";
import {
  Bars3Icon,
  ChevronRightIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { UserFragment } from "@/lib/graphql/generated/graphql";
import { ReactNode, useState } from "react";
import useScroll from "@/hooks/useScroll";
import { ProfileMenuItem } from "./ProfileMenuItem";
import Drawer from "./Drawer";

export default function TopBar({
  user,
  search,
  drawerTitle,
  drawerContent,
  logo,
}: {
  user?: UserFragment;
  search: ReactNode;
  drawerTitle: ReactNode;
  drawerContent: ReactNode;
  logo: ReactNode;
}) {
  const scrolled = useScroll();
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={cn([
        "flex items-center p-4 border-b h-[60px] sticky top-0 z-10 bg-white",
        scrolled ? "shadow-md" : "",
      ])}
    >
      <button
        type="button"
        onClick={() => setVisible(true)}
        className="md:hidden absolute left-2 p-2 rounded-md hover:bg-gray-300"
      >
        <Bars3Icon className="size-4" />
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
        {user ? <ProfileMenuItem user={user} /> : null}
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
