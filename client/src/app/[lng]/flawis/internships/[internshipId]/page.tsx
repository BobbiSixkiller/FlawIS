import Button from "@/components/Button";
import { PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getInternship } from "@/app/[lng]/internships/[internshipId]/actions";
import InternshipDialog from "@/app/[lng]/internships/InternshipDialog";
import DeleteInternshipDialog from "@/app/[lng]/internships/[internshipId]/DeleteInternshipDialog";

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

        <Button
          variant="ghost"
          as={Link}
          className="ml-auto rounded-full h-full p-2 text-gray-900 hover:bg-gray-100 max-w-fit hover:text-gray-400"
          href={`/internships`}
        >
          <XMarkIcon className="size-5" />
        </Button>
      </div>

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: internship.description }}
      />
    </div>
  );
}
