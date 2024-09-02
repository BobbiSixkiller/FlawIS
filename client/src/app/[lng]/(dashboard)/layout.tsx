import ActivateAccountDialog from "@/app/[lng]/(auth)/ActivateAccountDialog";
import { getMe } from "../(auth)/actions";
import SessionPolling from "@/components/SessionPolling";
import { useTranslation } from "@/lib/i18n";
import Logo from "@/components/Logo";
import { MobileNav, NavItem, ProfileMenuItem } from "@/components/MobileNav";
import { Role } from "@/lib/graphql/generated/graphql";
import {
  AcademicCapIcon,
  ArrowRightCircleIcon,
  ChevronRightIcon,
  HomeIcon,
  UserPlusIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import LngSwitcher from "@/components/LngSwitcher";
import { DashboardMessage } from "@/components/Message";
import Breadcrumbs from "@/components/Breadcrumbs";

export default async function DashboardLayout({
  children,
  modal,
  sidebar,
  params: { lng },
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  modal: React.ReactNode;
  params: { lng: string };
}) {
  const user = await getMe();
  console.log(user);

  const { t, i18n } = await useTranslation(lng, "landing");

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Desktop Nav */}
      <div className="sticky top-0 hidden lg:flex flex-col gap-6 h-screen w-full max-w-xs bg-primary-500 text-white px-4 py-6 inset-0 overflow-auto">
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
      {/* Dashboard content with sidebar */}
      <div className="flex-1 grid grid-cols-3 lg:divide-x gap-6 lg:gap-0">
        <div className="container mx-auto col-span-3 lg:col-span-2 p-6 flex flex-col gap-6">
          <Breadcrumbs
            homeElement={<HomeIcon className="h-5 w-5" />}
            separator={<ChevronRightIcon className="h-3 w-3" />}
            activeClasses="text-primary-500"
            containerClasses="flex flex-wrap text-sm gap-2 items-center"
            capitalizeLinks
          />
          {children}
        </div>

        <div className="hidden px-4 py-6 lg:col-span-1 lg:sticky lg:top-0 lg:h-screen lg:flex lg:flex-col lg:justify-between">
          {sidebar}
          <div className="hidden lg:block mt-auto">
            <ul className="text-xs text-gray-500">
              <li className="hover:underline hover:text-primary-500 cursor-pointer">
                <a
                  href="mailto:matus.muransky@flaw.uniba.sk"
                  className="focus:outline-primary-500"
                >
                  {t("contact")}
                </a>
              </li>
              <li className="hover:underline hover:text-primary-500 cursor-pointer">
                <a
                  className="focus:outline-primary-500"
                  target="_blank"
                  href={
                    i18n.language === "sk"
                      ? "https://uniba.sk/ochrana-osobnych-udajov/"
                      : "https://uniba.sk/en/privacy-policy/"
                  }
                >
                  {t("privacy")}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {/* Mobile footer */}
      <div className="lg:hidden col-span-3 bg-gray-900">
        <div className="container mx-auto p-6">
          <Logo lng={lng} height={60} width={60} inverted />

          <ul className="mt-4 text-xs text-gray-300 flex gap-2 divide-x divide-gray-300">
            <li className="hover:underline hover:text-white cursor-pointer">
              <a
                className="focus:outline-transparent"
                href="mailto:matus.muransky@flaw.uniba.sk"
              >
                {t("contact")}
              </a>
            </li>
            <li className="hover:underline hover:text-white cursor-pointer pl-2">
              <a
                className="focus:outline-transparent"
                target="_blank"
                href={
                  i18n.language === "sk"
                    ? "https://uniba.sk/ochrana-osobnych-udajov/"
                    : "https://uniba.sk/en/privacy-policy/"
                }
              >
                {t("privacy")}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {modal}

      <DashboardMessage lng={lng} />
      <ActivateAccountDialog lng={lng} user={user} />
      <SessionPolling />
    </div>
  );
}
