"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSelectedLayoutSegment,
} from "next/navigation";
import { Fragment, ReactNode, useState } from "react";
import {
  AcademicCapIcon,
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
  Bars3Icon,
  UserCircleIcon,
  UserPlusIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import LngSwitcher from "./LngSwitcher";
import Drawer from "./Drawer";
import { Role, UserFragment } from "@/lib/graphql/generated/graphql";
import { logout } from "@/app/[lng]/(auth)/actions";
import { useTranslation } from "@/lib/i18n/client";
import { Menu, Transition } from "@headlessui/react";

export function NavItem({
  children,
  route,
  onClick,
  lng,
}: {
  children: ReactNode;
  route: string;
  onClick?: () => void;
  lng: string;
}) {
  const segment = useSelectedLayoutSegment();
  const active = route === segment;

  return (
    <Link
      href={`/${lng}/${route}`}
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

  const { t } = useTranslation(lng, "landing");

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        className={`h-full w-full ${
          mobile
            ? "px-2 py-1 rounded-md hover:bg-gray-700 hover:bg-opacity-10 outline-none	focus:ring-2 focus:ring-inset focus:ring-primary-500"
            : "py-3 px-4 rounded-lg hover:bg-primary-700 outline-none	focus:ring-2 focus:ring-inset focus:ring-white"
        } flex items-center`}
      >
        <UserCircleIcon className="h-5 w-5 lg:mr-2" />
        <span className="hidden lg:block">{user?.name}</span>
        {path.includes("/profile") && (
          <span className="hidden lg:block ml-auto self-start">•</span>
        )}
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={`absolute ${
            mobile
              ? "right-0 mt-2 min-w-max w-32 origin-top-right"
              : "inset-x-0 mt-2"
          } rounded-md bg-white shadow-lg divide-y divide-gray-100 ring-1 ring-black/5 focus:outline-none`}
        >
          <div className="p-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-primary-500 text-white" : "text-gray-900"
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm ${
                    path.includes("/profile") ? "font-bold" : ""
                  }`}
                  onClick={() => router.push(`/${lng}/profile`)}
                >
                  <UserCircleIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                  {t("profile")}
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-primary-500 text-white" : "text-gray-900"
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  onClick={async () => logout()}
                >
                  <ArrowLeftCircleIcon
                    className="mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  {t("logout")}
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export function MobileNav({
  lng,
  user,
  logo,
  drawerTitle,
}: {
  lng: string;
  user?: UserFragment;
  logo: ReactNode;
  drawerTitle: ReactNode;
}) {
  const [menuShown, setMenuShown] = useState(false);
  const router = useRouter();

  const { t } = useTranslation(lng, "landing");

  return (
    <div className="lg:hidden sticky top-0 border-b bg-white">
      <div className="container h-[60px] mx-auto px-4 py-3 flex justify-between align-middle">
        <div className="flex gap-4">
          <div className="hidden sm:flex">{logo}</div>

          <button
            className="px-2 py-1 rounded-md hover:bg-gray-700 hover:bg-opacity-10 z-10 outline-none	focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={() => setMenuShown(true)}
          >
            <Bars3Icon className="h-5 w-5" />
            <span className="sr-only">Open main menu</span>
          </button>
        </div>
        <div className="flex sm:hidden absolute inset-0 m-auto">{logo}</div>

        {/* Right nav controls */}
        <div className="right-0 flex gap-1">
          <LngSwitcher mobile lng={lng} />
          {user && <ProfileMenuItem lng={lng} user={user} mobile />}
          {/* Responsive menu items inside drawer */}
          <Drawer
            visible={menuShown}
            setVisible={setMenuShown}
            size="xs"
            toggleStart="left"
            title={drawerTitle}
          >
            {user ? (
              <>
                {user.role === Role.Admin && (
                  <NavItem
                    lng={lng}
                    route="users"
                    onClick={() => setMenuShown(false)}
                  >
                    <UsersIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                    {t("users")}
                  </NavItem>
                )}
                <NavItem
                  lng={lng}
                  route="conferences"
                  onClick={() => setMenuShown(false)}
                >
                  <AcademicCapIcon
                    className="mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  {t("conferences")}
                </NavItem>
              </>
            ) : (
              <>
                <NavItem
                  lng={lng}
                  route="login"
                  onClick={() => setMenuShown(false)}
                >
                  <ArrowRightCircleIcon
                    className="mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  {t("login")}
                </NavItem>
                <NavItem
                  lng={lng}
                  route="register"
                  onClick={() => setMenuShown(false)}
                >
                  <UserPlusIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                  {t("register")}
                </NavItem>
              </>
            )}
          </Drawer>
        </div>
      </div>
    </div>
  );
}
