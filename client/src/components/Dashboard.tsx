import AccountMenu from "./AccountMenu";
import { ReactNode } from "react";
import { UserFragment } from "@/lib/graphql/generated/graphql";
import LngSwitcher from "./LngSwitcher";
import ThemeToggler from "./ThemeToggler";
import TopBar from "./TopBar";
import NavLink, { NavLinkProps } from "./NavLink";
import Footer from "./Footer";
import Logo from "./Logo";
import Avatar from "./Avatar";
import { cn } from "@/lib/utilsClient";
import { Snackbar } from "./Message";

export default async function Dashboard({
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
  return (
    <div className="flex flex-col lg:flex-row min-h-screen dark:bg-gray-950 w-screen">
      <div className="hidden lg:flex flex-col gap-4 p-4 bg-primary-500 dark:bg-gray-900 dark:border-r dark:border-gray-700 lg:w-full lg:max-w-xs h-screen sticky top-0">
        <Logo lng={lng} height={60} width={60} inverted />

        <nav className="flex flex-col gap-2">
          {navLinks.map((link, i) => (
            <NavLink key={i} {...link} />
          ))}
        </nav>

        <div className="mt-auto flex gap-2 items-center">
          <LngSwitcher />
          <ThemeToggler lng={lng} />
        </div>
      </div>

      <div
        className={cn([
          "min-w-0 flex-1 flex flex-col md:border-r w-full lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl",
          "dark:border-gray-700",
        ])}
      >
        <TopBar
          logo={<Logo lng={lng} notext height={40} width={40} />}
          drawer={{
            title: <Logo lng={lng} height={60} width={60} inverted />,
            content: (
              <>
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link, i) => (
                    <NavLink key={i} {...link} />
                  ))}
                </nav>

                <div className="mt-auto flex gap-2 items-center">
                  <LngSwitcher />
                  <ThemeToggler lng={lng} />
                </div>
              </>
            ),
          }}
          actions={
            <>
              {sidebar}
              <AccountMenu
                avatar={<Avatar name={user.name} avatarUrl={user.avatarUrl} />}
              />
            </>
          }
        />

        <div className="flex-1 flex flex-col p-4">{children}</div>

        <div className="md:hidden pt-16">
          <Footer lng={lng} />
        </div>
      </div>

      <div className="hidden md:flex flex-col xl:h-screen sticky top-0">
        <Footer lng={lng} />
      </div>

      <Snackbar />
    </div>
  );
}
