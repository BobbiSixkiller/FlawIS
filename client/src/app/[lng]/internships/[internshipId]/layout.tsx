import { ReactNode } from "react";
import { getMe } from "../../(auth)/actions";
import TabMenu from "@/components/TabMenu";
import { Access } from "@/lib/graphql/generated/graphql";
import { getInternship } from "./actions";

export default async function InternshipLayout({
  children,
  params: { internshipId },
}: {
  children: ReactNode;
  params: { lng: string; internshipId: string };
}) {
  const [user, internship] = await Promise.all([
    getMe(),
    getInternship(internshipId),
  ]);

  const showTabs =
    user.access.includes(Access.Admin) ||
    user.access.includes(Access.Organization);

  return (
    <div>
      {showTabs && internship && (
        <TabMenu
          tabs={[
            { href: `/${internshipId}`, name: "Staz" },
            {
              href: `/${internshipId}/applications`,
              name: `Prihlaseni (${internship.applicationsCount})`,
            },
          ]}
        />
      )}
      {children}
    </div>
  );
}
