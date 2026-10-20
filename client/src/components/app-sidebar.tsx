"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { stripPathLocale } from "@/lib/i18n/settings";
import type { NavLinkProps } from "./nav-link";
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

export default function AppSidebar({
  navLinks,
  logo,
  footer,
  label,
}: {
  navLinks: NavLinkProps[];
  logo: ReactNode;
  footer: ReactNode;
  label: string;
}) {
  const pathname =
    stripPathLocale(usePathname()).replace(/^\/flawis(?=\/|$)/, "") || "/";
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <Sidebar
      role="complementary"
      aria-label={label}
      collapsible="offcanvas"
      className="border-r border-sidebar-border"
    >
      <SidebarHeader className="border-b border-sidebar-border p-5">
        <Link href="/" className="rounded-md">
          {logo}
        </Link>
        <span className="mt-3 text-xs font-medium text-muted-foreground">
          {label}
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="p-3">
          <SidebarGroupContent>
            <nav aria-label={label}>
              <SidebarMenu className="gap-1">
                {navLinks.map((link) => {
                  const active =
                    pathname === link.href ||
                    pathname.startsWith(`${link.href}/`);
                  return (
                    <SidebarMenuItem key={link.href}>
                      <SidebarMenuButton
                        isActive={active}
                        className="h-11 gap-3 px-3 text-sm data-active:font-medium data-active:shadow-[inset_3px_0_0_var(--primary)] [&_svg]:mr-0 [&_svg]:size-5"
                        render={
                          <Link
                            href={link.href}
                            aria-current={active ? "page" : undefined}
                            onClick={() => {
                              if (isMobile) setOpenMobile(false);
                              link.onClick?.();
                            }}
                          />
                        }
                      >
                        {link.icon}
                        <span>{link.text}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        {footer}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
