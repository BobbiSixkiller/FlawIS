"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { stripPathLocale } from "@/lib/i18n/settings";
import Icon, { type IconName } from "./icon";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "./ui/sidebar";

export type NavItem = { title: string; href: string; icon: IconName };

export default function AppSidebar({
  navItems,
  logo,
  footer,
  navigationLabel,
  homeLabel,
}: {
  navItems: NavItem[];
  logo: ReactNode;
  footer: ReactNode;
  navigationLabel: string;
  homeLabel: string;
}) {
  const pathname =
    stripPathLocale(usePathname()).replace(/^\/flawis(?=\/|$)/, "") || "/";
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <Sidebar
      role="complementary"
      aria-label={navigationLabel}
      collapsible="icon"
      className="z-30 border-sidebar-border"
    >
      <SidebarHeader className="shrink-0 group-data-[collapsible=icon]:px-3">
        <Link
          href="/"
          aria-label={homeLabel}
          className="flex h-12 shrink-0 items-center overflow-hidden rounded-md px-2 transition-[width,height] ease-linear group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:px-0"
          onClick={() => {
            if (isMobile) setOpenMobile(false);
          }}
        >
          {logo}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="group-data-[collapsible=icon]:px-3">
          <SidebarGroupContent>
            <nav aria-label={navigationLabel}>
              <SidebarMenu className="gap-2">
                {navItems.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={item.title}
                        aria-label={item.title}
                        render={
                          <Link
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            onClick={() => {
                              if (isMobile) setOpenMobile(false);
                            }}
                          />
                        }
                      >
                        <Icon name={item.icon} aria-hidden="true" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="relative z-30 items-start overflow-visible border-t border-sidebar-border group-data-[collapsible=icon]:px-3">
        {footer}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
