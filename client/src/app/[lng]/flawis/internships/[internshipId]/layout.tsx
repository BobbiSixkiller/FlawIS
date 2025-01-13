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
    <div>
      <TabMenu
        tabs={[
          { href: `/${internshipId}`, name: "Staz" },
          {
            href: `/${internshipId}/applications`,
            name: `Prihlaseni ${
              internship?.applicationsCount
                ? `(${internship.applicationsCount})`
                : ""
            }`,
          },
        ]}
      />
      {children}
    </div>
  );
}
