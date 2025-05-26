import { ReactNode } from "react";
import { UserFragment } from "@/lib/graphql/generated/graphql";
import LngSwitcher from "./LngSwitcher";
import ThemeToggler from "./ThemeToggler";
import TopBar from "./TopBar";
import NavLink, { NavLinkProps } from "./NavLink";
import Footer from "./Footer";
import Logo from "./Logo";
import Breadcrumbs from "./Breadcrumbs";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";
import { cookies } from "next/headers";
import Avatar from "./Avatar";
import { cn } from "@/utils/helpers";

export default function Dashboard({
  children,
  navLinks,
  sidebar,
  user,
  lng,
}: {
  navLinks: NavLinkProps[];
  children: ReactNode;
  sidebar: ReactNode;
  user: UserFragment;
  lng: string;
}) {
  const theme = cookies().get("theme")?.value || "";

  return (
    <div className="flex flex-col md:flex-row min-h-screen dark:bg-gray-950">
      <div className="hidden md:flex flex-col gap-4 p-4 bg-primary-500  lg:w-full lg:max-w-xs h-screen sticky top-0">
        <Logo lng={lng} height={60} width={60} inverted />

        <nav className="flex flex-col gap-2">
          {navLinks.map((link, i) => (
            <NavLink key={i} {...link} />
          ))}
        </nav>

        <div className="mt-auto flex gap-2 items-center">
          <LngSwitcher lng={lng} className="flex-1" />
          <ThemeToggler dark={theme === "dark"} />
        </div>
      </div>

      <div
        className={cn([
          "flex flex-1 flex-col md:border-r",
          "dark:border-gray-700",
        ])}
      >
        <TopBar
          logo={<Logo notext height={40} width={40} />}
          drawerTitle={<Logo lng={lng} height={60} width={60} inverted />}
          drawerContent={
            <>
              <nav className="flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <NavLink key={i} {...link} />
                ))}
              </nav>

              <div className="mt-auto flex gap-2 items-center">
                <LngSwitcher lng={lng} className="flex-1" />
                <ThemeToggler dark={theme === "dark"} />
              </div>
            </>
          }
          search={sidebar}
          avatar={<Avatar name={user.name} avatarUrl={user.avatarUrl} />}
        />

        <Breadcrumbs
          homeElement={<HomeIcon className="h-5 w-5" />}
          separator={<ChevronRightIcon className="h-3 w-3" />}
          activeClasses="text-primary-500 hover:underline"
          containerClasses="md:hidden p-4 flex flex-wrap text-sm gap-2 items-center dark:text-white/85"
          listClasses="outline-none focus:ring-2 focus:ring-primary-500"
          capitalizeLinks
        />

        <div className="h-full p-4">{children}</div>
        <div className="md:hidden pt-16">
          <Footer lng={lng} />
        </div>
      </div>

      <div className="hidden md:flex flex-col h-screen xl:w-full xl:max-w-sm sticky top-0">
        <Footer lng={lng} />
      </div>
    </div>
  );
}
