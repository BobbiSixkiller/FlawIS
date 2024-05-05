import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import DeleteSubmissionForm from "./DeleteSubmissionForm";
import { getSubmission } from "../actions";
import { FormMessage } from "@/components/Message";

export default async function DeleteSubmissionPage({
  params: { lng, slug, id },
}: {
  params: { lng: string; slug: string; id: string };
}) {
  const submission = await getSubmission(id);

  return (
    <div className="flex flex-col gap-4">
      <Link
        className="rounded-full p-2 text-gray-900 hover:bg-gray-100 max-w-fit hover:text-gray-400"
        href={`/conferences/${slug}/submissions`}
      >
        <XMarkIcon className="w-5 h-5" />
      </Link>
      <div className="mx-auto w-full sm:mx-auto sm:max-w-96 flex flex-col gap-4">
        <FormMessage lng={lng} />
        <DeleteSubmissionForm lng={lng} submission={submission} />
      </div>
    </div>
  );
}
