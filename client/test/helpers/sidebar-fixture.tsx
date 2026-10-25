import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import AppSidebar from "../../src/components/app-sidebar";
import {
  SidebarProvider,
  SidebarTrigger,
} from "../../src/components/ui/sidebar";

export function SidebarFixture({
  path = "/en/flawis/users/42",
  defaultOpen = true,
}: {
  path?: string;
  defaultOpen?: boolean;
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
          footer={<button type="button">Preferences</button>}
        />
        <SidebarTrigger aria-label="Toggle navigation" />
      </SidebarProvider>
    </PathnameContext.Provider>
  );
}
