import { ReactNode } from "react";
import { getMe } from "../../(auth)/actions";
import TabMenu from "@/components/TabMenu";
import { Access } from "@/lib/graphql/generated/graphql";
import { getInternship } from "./actions";
import { translate } from "@/lib/i18n";

export default async function InternshipLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lng: string; internshipId: string }>;
}) {
  const { internshipId, lng } = await params;
  const [user, internship] = await Promise.all([
    getMe(),
    getInternship(internshipId),
  ]);

  const showTabs =
    user.access.includes(Access.Admin) ||
    user.access.includes(Access.Organization);

  const { t } = await translate(lng, "internships");

  return (
    <div className="flex flex-1 flex-col">
      {showTabs && internship && (
        <TabMenu
          tabs={[
            { href: `/${internshipId}`, name: t("internship") },
            {
              href: `/${internshipId}/applications`,
              name: t("applied", {
                count: internship.applicationsCount,
              }),
            },
          ]}
        />
      )}
      {children}
    </div>
  );
}
