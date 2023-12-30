import { ReactNode } from "react";

import {
  UserCircleIcon,
  ArrowRightCircleIcon,
  UserPlusIcon,
  UsersIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import LngSwitcher from "./LngSwitcher";
import { Role, User } from "@/lib/graphql/generated/graphql";
import Logo from "./Logo";
import { MobileNav, NavItem, ProfileMenuItem } from "./MobileNav";
import { useTranslation } from "@/lib/i18n";

export async function Nav({
  children,
  lng,
  user,
}: {
  children: ReactNode;
  lng: string;
  user?: Omit<User, "grants">;
}) {
  const { t } = await useTranslation(lng, "landing");

  return (
    <div className="lg:flex">
      {/* Desktop nav */}
      <div className="hidden relative lg:flex flex-col gap-6 h-screen w-screen max-w-xs bg-primary-500 text-white px-4 py-6 inset-0 overflow-auto">
        <div>
          <Logo lng={lng} height={60} width={60} inverted />
        </div>
        <div className="flex flex-1 flex-col justify-between gap-2">
          <nav>
            {user ? (
              <>
                {user.role === Role.Admin && (
                  <NavItem lng={lng} route="users">
                    <UsersIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                    {t("users")}
                  </NavItem>
                )}
                <NavItem lng={lng} route="conferences">
                  <AcademicCapIcon
                    className="mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  {t("conferences")}
                </NavItem>
                <ProfileMenuItem lng={lng} user={user} />
              </>
            ) : (
              <>
                <NavItem lng={lng} route="login">
                  <ArrowRightCircleIcon
                    className="mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  {t("login")}
                </NavItem>
                <NavItem lng={lng} route="register">
                  <UserPlusIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                  {t("register")}
                </NavItem>
              </>
            )}
          </nav>
          <LngSwitcher lng={lng} />
        </div>
      </div>
      <MobileNav
        lng={lng}
        user={user}
        logo={<Logo lng={lng} width={36} height={36} notext />}
        drawerTitle={<Logo inverted lng={lng} height={60} width={60} />}
      />
      <div className="container mx-auto min-h-screen px-4 lg:px-6 py-6">
        {children}
      </div>
    </div>
  );
}
