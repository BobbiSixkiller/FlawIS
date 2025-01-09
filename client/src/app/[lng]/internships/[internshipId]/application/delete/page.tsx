import Button from "@/components/Button";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import DeleteApplicationForm from "./DeleteApplicationForm";
import { getInternship } from "../../actions";
import { redirect } from "next/navigation";

export default async function DeleteApplicationPage({
  params: { internshipId, lng },
}: {
  params: { internshipId: string; lng: string };
}) {
  const internship = await getInternship(internshipId);
  if (!internship.myApplication) {
    redirect(`/${internshipId}`);
  }

  return (
    <div className="flex flex-col">
      <Button
        variant="ghost"
        as={Link}
        className="ml-auto rounded-full h-full p-2 text-gray-900 hover:bg-gray-100 max-w-fit hover:text-gray-400"
        href={`/${internshipId}`}
      >
        <XMarkIcon className="size-5" />
      </Button>
      <div className="mx-auto">
        <DeleteApplicationForm id={internship.myApplication.id} />
      </div>
    </div>
  );
}
