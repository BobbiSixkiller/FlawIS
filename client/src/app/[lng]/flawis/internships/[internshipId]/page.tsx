import { redirect } from "next/navigation";
import { getInternship } from "@/app/[lng]/internships/[internshipId]/actions";
import InternshipDialog from "@/app/[lng]/internships/InternshipDialog";
import DeleteInternshipDialog from "@/app/[lng]/internships/[internshipId]/DeleteInternshipDialog";
import CloseButton from "@/components/CloseButton";

export default async function InternshipPage({
  params: { internshipId },
}: {
  params: { internshipId: string };
}) {
  const internship = await getInternship(internshipId);
  if (!internship) {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <InternshipDialog data={internship} />
        <DeleteInternshipDialog />

        <CloseButton href={`/internships`} />
      </div>

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: internship.description }}
      />
    </div>
  );
}
