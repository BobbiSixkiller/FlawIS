import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import type { ReactNode } from "react";
import AppSidebar from "../../src/app/[lng]/flawis/_components/app-sidebar";
import {
  SidebarProvider,
  SidebarTrigger,
} from "../../src/components/ui/sidebar";

export function SidebarFixture({
  path = "/en/flawis/users/42",
  defaultOpen = true,
  footer = <button type="button">Preferences</button>,
}: {
  path?: string;
  defaultOpen?: boolean;
  footer?: ReactNode;
}) {
  return (
    <PathnameContext.Provider value={path}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar
          navItems={[
            { title: "Users", href: "/users", icon: "users" },
            { title: "Courses", href: "/courses", icon: "academic-cap" },
          ]}
          navigationLabel="Navigation"
          homeLabel="Home"
          logo={<span>Faculty of Law</span>}
          footer={footer}
        />
        <SidebarTrigger aria-label="Toggle navigation" />
      </SidebarProvider>
    </PathnameContext.Provider>
  );
}
