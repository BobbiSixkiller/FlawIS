import Button from "@/components/Button";
import {
  InboxArrowDownIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { getInternship } from "./actions";
import { notFound } from "next/navigation";

export default async function InternshipPge({
  params: { id },
}: {
  params: { id: string };
}) {
  const internship = await getInternship(id);
  if (!internship) {
    return notFound();
  }

  console.log(internship.description);

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button
          scroll={false}
          variant="secondary"
          as={Link}
          className="rounded-full h-full p-2 text-white"
          href={`/${id}/update`}
        >
          <PencilIcon className="size-5" />
        </Button>
        <Button
          scroll={false}
          variant="destructive"
          as={Link}
          className="rounded-full h-full p-2 text-white mr-auto"
          href={`/${id}/delete`}
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
      <Button type="button" className="w-full">
        <InboxArrowDownIcon className="size-5 stroke-2 mr-2" /> Prihlasit
      </Button>
    </div>
  );
}
