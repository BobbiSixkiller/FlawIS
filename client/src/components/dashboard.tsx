import type { ReactNode } from "react";
import { cookies } from "next/headers";
import type { UserFragment } from "@/lib/graphql/generated/graphql";
import { translate } from "@/lib/i18n";
import { SidebarInset, SidebarProvider } from "./ui/sidebar";
import AppSidebar from "./app-sidebar";
import DashboardHeader from "./dashboard-header";
import AccountMenu from "./account-menu";
import Avatar from "./avatar";
import LngSwitcher from "./lng-switcher";
import ThemeToggler from "./theme-toggler";
import type { NavLinkProps } from "./nav-link";
import Footer from "./footer";
import Logo from "./logo";
import { Snackbar } from "./message";
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
  const [{ t }, cookieStore] = await Promise.all([
    translate(lng, "dashboard"),
    cookies(),
  ]);
  return (
    <SidebarProvider
      defaultOpen={cookieStore.get("sidebar_state")?.value !== "false"}
    >
      <a
        href="#main-content"
        className="sr-only fixed top-3 left-3 z-[100] rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only"
      >
        {t("skipToContent")}
      </a>
      <AppSidebar
        navLinks={navLinks}
        logo={<Logo lng={lng} height={40} width={40} />}
        label={t("administration")}
        footer={
          <div className="flex items-center justify-between gap-2">
            <LngSwitcher />
            <ThemeToggler lng={lng} />
          </div>
        }
      />
      <SidebarInset className="min-w-0 bg-background">
        <DashboardHeader
          navigationLabel={t("openNavigation")}
          actions={
            <>
              {sidebar}
              <AccountMenu
                avatar={<Avatar name={user.name} avatarUrl={user.avatarUrl} />}
              />
            </>
          }
        />
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 outline-none sm:p-6 lg:p-8"
        >
          {children}
        </main>
        <Footer lng={lng} />
      </SidebarInset>
      <Snackbar />
    </SidebarProvider>
  );
}
