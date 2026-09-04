import { ReactNode } from "react";
import TabMenu from "@/components/TabMenu";
import { getInternship } from "./actions";
import { translate } from "@/lib/i18n";
import { getOptionalViewer } from "@/lib/optionalViewer";
import {
  getInternshipAccess,
  isObjectId,
} from "@/lib/internshipAccess";
import { notFound } from "next/navigation";

export default async function InternshipLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lng: string; internshipId: string }>;
}) {
  const { internshipId, lng } = await params;

  if (!isObjectId(internshipId)) {
    notFound();
  }

  const [user, internship] = await Promise.all([
    getOptionalViewer(),
    getInternship(internshipId),
  ]);

  if (!internship) {
    notFound();
  }

  const access = getInternshipAccess(user, internship.user);

  const { t } = await translate(lng, "internships");

  return (
    <div className="flex flex-1 flex-col">
      {access.canManage && (
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
