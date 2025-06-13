import { ReactNode } from "react";
import TabMenu from "@/components/TabMenu";
import { getInternship } from "@/app/[lng]/internships/[internshipId]/actions";

export default async function InternshipLayout({
  children,
  params: { internshipId },
}: {
  children: ReactNode;
  params: { lng: string; internshipId: string };
}) {
  const internship = await getInternship(internshipId);

  return (
    <div className="h-full flex flex-col">
      <TabMenu
        tabs={[
          { href: `/internships/${internshipId}`, name: "Staz" },
          {
            href: `/internships/${internshipId}/applications`,
            name: `Prihlaseni ${
              internship?.applicationsCount
                ? `(${internship.applicationsCount})`
                : ""
            }`,
          },
        ]}
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}
