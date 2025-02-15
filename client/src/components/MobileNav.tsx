"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSelectedLayoutSegment,
} from "next/navigation";
import { Fragment, ReactNode, useEffect, useState } from "react";
import {
  ArrowLeftCircleIcon,
  Bars3Icon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Drawer from "./Drawer";
import { UserFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import DynamicImageClient from "./DynamicImageClient";
import { cn } from "@/utils/helpers";

export function NavItem({
  children,
  route,
  onClick,
}: {
  children: ReactNode;
  route: string;
  onClick?: () => void;
}) {
  const segment = useSelectedLayoutSegment();
  const active = route === segment || (segment === null && route === "/");

  return (
    <Link
      href={`/${route}`}
      className="flex items-center py-3 px-4 rounded-lg hover:bg-primary-700 outline-none	focus:ring-2 focus:ring-inset focus:ring-white"
      onClick={onClick}
    >
      {children}
      {active && <span className="ml-auto self-start">•</span>}
    </Link>
  );
}

export function ProfileMenuItem({
  lng,
  mobile,
  user,
}: {
  lng: string;
  mobile?: boolean;
  user?: UserFragment;
}) {
  const router = useRouter();
  const path = usePathname();

  const { t } = useTranslation(lng, "dashboard");

  return (
    <Menu as="div" className="relative h-fit my-auto mr-2 lg:m-0">
      <MenuButton
        className={`h-fit w-full ${
          mobile
            ? "rounded-full outline-none focus:ring-2 focus:ring-primary-500"
            : "py-3 px-4 rounded-lg hover:bg-primary-700 outline-none	focus:ring-2 focus:ring-inset focus:ring-white"
        } flex items-center`}
      >
        {user?.avatarUrl ? (
          <DynamicImageClient
            src={user.avatarUrl}
            alt="Avatar"
            className="size-8 lg:size-5 rounded-full lg:mr-2"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <UserCircleIcon className="size-5 lg:mr-2" />
        )}
        <span className="hidden lg:block">{user?.name}</span>
        {path.includes("/profile") && (
          <span className="hidden lg:block ml-auto self-start">•</span>
        )}
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems
          className={cn([
            "absolute rounded-md bg-white shadow-lg divide-y divide-gray-100 ring-1 ring-black/5 focus:outline-none text-gray-900",
            "dark:bg-gray-700 dark:text-white",
            mobile
              ? "right-0 mt-2 min-w-max w-32 origin-top-right"
              : "inset-x-0 mt-2",
          ])}
        >
          <div className="p-1">
            <MenuItem>
              {({ focus }) => (
                <button
                  className={`${
                    focus ? "bg-primary-500 text-white" : ""
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm ${
                    path.includes("/profile") ? "font-bold" : ""
                  }`}
                  onClick={() => router.push(`/profile`)}
                >
                  <UserCircleIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                  {t("profile")}
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  className={`${
                    focus ? "bg-primary-500 text-white" : ""
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  onClick={() => router.push("/logout")}
                >
                  <ArrowLeftCircleIcon
                    className="mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  {t("logout")}
                </button>
              )}
            </MenuItem>
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
}

export function MobileNav({
  lng,
  user,
  logo,
  drawerTitle,
  children,
}: {
  lng: string;
  user?: UserFragment;
  logo: ReactNode;
  drawerTitle: ReactNode;
  children: ReactNode;
}) {
  const [menuShown, setMenuShown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = usePathname();

  useEffect(() => {
    setMenuShown(false);
  }, [path]);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const { t } = useTranslation(lng, "landing");

  return (
    <div
      className={`lg:hidden sticky top-0 border-b bg-white dark:bg-gray-900 dark:border-gray-900 z-10 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="container h-[60px] mx-auto px-4 py-3 flex justify-between align-middle">
        <div className="flex gap-4">
          <div className="hidden sm:block m-auto">{logo}</div>
          <button
            className="px-2 py-1 rounded-md dark:text-white dark:hover:bg-gray-700 hover:bg-gray-700 hover:bg-opacity-10 z-10 outline-none	focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={() => setMenuShown(true)}
          >
            <Bars3Icon className="h-5 w-5" />
            <span className="sr-only">Open main menu</span>
          </button>
        </div>
        <div className="flex sm:hidden absolute inset-0">
          <div className="m-auto">{logo}</div>
        </div>

        {/* Right nav controls */}
        <div className="right-0 flex gap-1">
          {user && <ProfileMenuItem lng={lng} user={user} mobile />}
          {/* Responsive menu items inside drawer */}
          <Drawer
            visible={menuShown}
            setVisible={setMenuShown}
            size="xs"
            toggleStart="left"
            title={drawerTitle}
          >
            {children}
          </Drawer>
        </div>
      </div>
    </div>
  );
}
