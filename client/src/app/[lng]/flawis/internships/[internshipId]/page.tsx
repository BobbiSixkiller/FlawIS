import Button from "@/components/Button";
import { PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getInternship } from "@/app/[lng]/internships/[internshipId]/actions";

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
      <div className="flex justify-end gap-2">
        <Button
          scroll={false}
          variant="secondary"
          as={Link}
          className="rounded-full h-full p-2"
          href={`/${internshipId}/update`}
        >
          <PencilIcon className="size-5" />
        </Button>
        <Button
          scroll={false}
          variant="destructive"
          as={Link}
          className="rounded-full h-full p-2 mr-auto"
          href={`/${internshipId}/delete`}
        >
          <TrashIcon className="size-5" />
        </Button>

        <Button
          variant="ghost"
          as={Link}
          className="rounded-full h-full p-2 text-gray-900 hover:bg-gray-100 max-w-fit hover:text-gray-400"
          href={`/`}
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
