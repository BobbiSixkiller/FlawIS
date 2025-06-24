import { ReactNode } from "react";
import TabMenu from "@/components/TabMenu";
import { getInternship } from "@/app/[lng]/internships/[internshipId]/actions";
import { translate } from "@/lib/i18n";
import { redirect } from "next/navigation";

export default async function InternshipLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lng: string; internshipId: string }>;
}) {
  const { internshipId, lng } = await params;
  const internship = await getInternship(internshipId);
  if (!internship) {
    redirect("/internships");
  }

  const { t } = await translate(lng, "internships");

  return (
    <div className="h-full flex flex-col">
      <TabMenu
        tabs={[
          { href: `/internships/${internshipId}`, name: t("internship") },
          {
            href: `/internships/${internshipId}/applications`,
            name: t("applied", {
              count: internship.applicationsCount,
            }),
          },
        ]}
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}
