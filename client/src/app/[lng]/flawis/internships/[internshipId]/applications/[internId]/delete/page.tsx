import { getInternship } from "@/app/[lng]/internships/[internshipId]/actions";
import DeleteApplicationForm from "@/app/[lng]/internships/[internshipId]/application/delete/DeleteApplicationForm";
import { getIntern } from "@/app/[lng]/internships/[internshipId]/applications/actions";
import Button from "@/components/Button";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DeleteApplicationPage({
  params: { internshipId, internId },
}: {
  params: { internshipId: string; internId: string; lng: string };
}) {
  const intern = await getIntern(internId);
  if (!intern) {
    redirect(`/internships/${internshipId}/applications`);
  }

  return (
    <div className="flex flex-col">
      <Button
        variant="ghost"
        as={Link}
        className="ml-auto rounded-full h-full p-2 text-gray-900 hover:bg-gray-100 max-w-fit hover:text-gray-400"
        href={`/internships/${internshipId}/applications/${internId}`}
      >
        <XMarkIcon className="size-5" />
      </Button>
      <div className="mx-auto">
        <DeleteApplicationForm id={intern.id} />
      </div>
    </div>
  );
}
