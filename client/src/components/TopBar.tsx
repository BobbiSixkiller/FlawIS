"use client";

import { cn } from "@/utils/helpers";
import Breadcrumbs from "./Breadcrumbs";
import {
  ArrowLeftStartOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  ChevronRightIcon,
  HomeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { ReactNode, useEffect, useState } from "react";
import Drawer from "./Drawer";
import Dropdown from "./Dropdown";
import { useTranslation } from "@/lib/i18n/client";
import { useParams, usePathname } from "next/navigation";
import Button from "./Button";
import Link from "next/link";
import { useWindowScroll } from "@uidotdev/usehooks";

export default function TopBar({
  avatar,
  search,
  drawerTitle,
  drawerContent,
  logo,
}: {
  avatar?: ReactNode;
  search: ReactNode;
  drawerTitle: ReactNode;
  drawerContent: ReactNode;
  logo: ReactNode;
}) {
  const [{ y = 0 }] = useWindowScroll();

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
        "bg-white sticky top-0 z-20 h-[60px] border-b",
        "dark:border-gray-700 dark:bg-gray-900",
        y ?? 0 > 0 ? "shadow-bottom" : "",
      ])}
    >
      <div className={cn(["h-full flex items-center p-4 container mx-auto"])}>
        <Button
          onClick={() => setVisible(true)}
          className={cn([
            "lg:hidden sm:static",
            "sm:mr-4 absolute left-2 p-2 w-fit",
          ])}
          variant="ghost"
        >
          <Bars3Icon className="size-5" />
        </Button>

        <div className={cn(["mx-auto", "md:hidden"])}>{logo}</div>

        <Breadcrumbs
          homeElement={<HomeIcon className="h-5 w-5" />}
          separator={<ChevronRightIcon className="h-3 w-3" />}
          activeClasses="text-primary-500 dark:text-primary-300 hover:underline"
          containerClasses="hidden md:flex flex-wrap text-sm gap-2 items-center dark:text-white/85"
          listClasses="outline-none focus:ring-2 focus:ring-primary-500"
          capitalizeLinks
        />

        <div className="absolute sm:static right-4 flex md:flex-1 md:justify-end items-center gap-2">
          {search}

          {avatar ? (
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
                <Link href="/profile" key={0}>
                  <UserCircleIcon className="size-5" aria-hidden="true" />
                  {t("profile")}
                </Link>,
                <Link prefetch={false} href="/logout" key={1}>
                  <ArrowLeftStartOnRectangleIcon
                    className="size-5"
                    aria-hidden="true"
                  />
                  {t("logout")}
                </Link>,
              ]}
            />
          ) : (
            <Button as={Link} href="/login" variant="ghost" size="icon">
              <ArrowRightStartOnRectangleIcon className="size-5" />
            </Button>
          )}
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
    </div>
  );
}
