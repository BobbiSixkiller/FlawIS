import Button from "@/components/Button";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import InternshipForm from "../../new/InternshipForm";
import { getInternship } from "../actions";

export default async function UpdateInternship({
  params: { id },
}: {
  params: { lng: string; id: string };
}) {
  const internship = await getInternship(id);

  return (
    <div className="flex flex-col">
      <Button
        variant="ghost"
        as={Link}
        className="ml-auto rounded-full h-full p-2 text-gray-900 hover:bg-gray-100 max-w-fit hover:text-gray-400"
        href={`/${id}`}
      >
        <XMarkIcon className="size-5" />
      </Button>
      <div className="mx-auto">
        <InternshipForm data={internship} />
      </div>
    </div>
  );
}
