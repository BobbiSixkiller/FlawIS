"use client";

import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { ReactNode, useState } from "react";
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
import Dropdown, { DropdownItem } from "./Dropdown";
import Drawer from "./Drawer";
import { Role, User } from "@/lib/graphql/generated/graphql";
import { logout } from "@/app/[lng]/(auth)/actions";
import { useTranslation } from "@/lib/i18n/client";

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
  const active = route === segment;

  return (
    <Link
      href={`/${route}`}
      className="flex items-center py-3 px-4 rounded-lg hover:bg-primary-700"
      onClick={onClick}
    >
      {children}
      {active && <span className="ml-auto self-start">•</span>}
    </Link>
  );
}

export function MobileNav({
  lng,
  user,
  logo,
  drawerTitle,
}: {
  lng: string;
  user?: Omit<User, "grants">;
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
            className="px-2 py-1 rounded-md hover:bg-gray-700 hover:bg-opacity-10 z-10"
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
          {user && (
            <Dropdown trigger={<UserCircleIcon className="h-5 w-5" />}>
              <div className="p-1">
                <DropdownItem handleClick={() => router.push("/profile")}>
                  <UserCircleIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                  Profil
                </DropdownItem>
                <DropdownItem handleClick={async () => logout()}>
                  <ArrowLeftCircleIcon
                    className="mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  Odhlasit
                </DropdownItem>
              </div>
            </Dropdown>
          )}
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
                  <NavItem route="users" onClick={() => setMenuShown(false)}>
                    <UsersIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                    {t("users")}
                  </NavItem>
                )}
                <NavItem
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
                <NavItem route="login" onClick={() => setMenuShown(false)}>
                  <ArrowRightCircleIcon
                    className="mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  {t("login")}
                </NavItem>
                <NavItem route="register" onClick={() => setMenuShown(false)}>
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
