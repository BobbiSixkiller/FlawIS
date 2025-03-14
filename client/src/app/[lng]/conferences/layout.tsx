import ActivateAccountDialog from "@/app/[lng]/(auth)/ActivateAccountDialog";
import { getMe } from "../(auth)/actions";
import SessionPolling from "@/components/SessionPolling";
import Logo from "@/components/Logo";
import { MobileNav, NavItem, ProfileMenuItem } from "@/components/MobileNav";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";
import LngSwitcher from "@/components/LngSwitcher";
import Breadcrumbs from "@/components/Breadcrumbs";
import { translate } from "@/lib/i18n";
import { Metadata, ResolvingMetadata } from "next";
import { cookies, headers } from "next/headers";
import ThemeToggler from "@/components/ThemeToggler";

export async function generateMetadata(
  {
    params: { lng },
  }: {
    params: { lng: string };
    sidebar: React.ReactNode;
    modal: React.ReactNode;
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { t } = await translate(lng, "dashboard");
  const host = headers().get("host") || "flawis.flaw.uniba.sk";
  const tenant = host.split(".")[0].replace("-staging", "");

  const url =
    process.env.NODE_ENV !== "development"
      ? new URL(`https://${host}`)
      : undefined;
  const title = `${t("conferences")} | ${t("title")}`;
  const description = t(`${tenant}Desc`);

  return {
    metadataBase: url,
    title,
    description,
    openGraph: {
      url,
      type: "website",
      siteName: "FlawIS",
      locale: lng,
      title,
      description,
      images: [`/images/Praf-logo-text-${lng}.png`],
    },
  };
}

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

  const { t, i18n } = await translate(lng, "dashboard");

  const theme = cookies().get("theme")?.value;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Desktop Nav */}
      <div className="sticky top-0 hidden lg:flex flex-col gap-6 h-screen w-full max-w-xs bg-primary-500 text-white px-4 py-6 inset-0 overflow-auto">
        <div>
          <Logo lng={lng} height={60} width={60} inverted />
        </div>
        <div className="flex flex-1 flex-col justify-between gap-2">
          <nav>
            <NavItem route="/">
              <HomeIcon className="mr-2 h-5 w-5" aria-hidden="true" />
              {t("home")}
            </NavItem>
            <ProfileMenuItem lng={lng} user={user} />
          </nav>

          <div className="mt-auto flex gap-2 items-center">
            <LngSwitcher lng={lng} className="flex-1" />
            <ThemeToggler dark={theme === "dark"} />
          </div>
        </div>
      </div>
      <MobileNav
        lng={lng}
        user={user}
        logo={<Logo lng={lng} width={36} height={36} notext />}
        drawerTitle={<Logo inverted lng={lng} height={60} width={60} />}
      >
        <NavItem route="/">
          <HomeIcon className="mr-2 h-5 w-5" aria-hidden="true" />
          {t("home")}
        </NavItem>

        <div className="mt-auto flex gap-2 items-center">
          <LngSwitcher lng={lng} className="flex-1" />
          <ThemeToggler dark={theme === "dark"} />
        </div>
      </MobileNav>
      {/* Dashboard content with sidebar */}
      <div className="flex-1 grid grid-cols-3 lg:divide-x dark:bg-gray-800 dark:lg:divide-gray-600 gap-6 lg:gap-0">
        <div className="container mx-auto col-span-3 lg:col-span-2 p-6 flex flex-col gap-6">
          <Breadcrumbs
            homeElement={<HomeIcon className="h-5 w-5" />}
            separator={<ChevronRightIcon className="h-3 w-3" />}
            activeClasses="text-primary-500 hover:underline"
            containerClasses="flex flex-wrap text-sm gap-2 items-center dark:text-white"
            capitalizeLinks
          />
          {children}
        </div>

        <div className="hidden px-4 py-6 lg:col-span-1 lg:sticky lg:top-0 lg:h-screen lg:flex lg:flex-col lg:justify-between">
          <div className="w-full max-w-96">{sidebar}</div>
          <div className="hidden lg:block mt-auto">
            <ul className="text-xs text-gray-500 dark:text-gray-400">
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
      <div className="lg:hidden col-span-3 bg-gray-900 border-none">
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

      <ActivateAccountDialog lng={lng} user={user} />
      <SessionPolling />
    </div>
  );
}
