import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import NewSubmissionForm from "./NewSubmissionForm";
import { getConference } from "@/app/[lng]/flawis/conferences/actions";

export default async function AddSubmissionPage({
  params: { lng, slug },
}: {
  params: { lng: string; slug: string };
}) {
  const conference = await getConference(slug);

  return (
    <div className="flex flex-col gap-4">
      <Link
        className="rounded-full p-2 text-gray-900 hover:bg-gray-100 max-w-fit hover:text-gray-400"
        href={`/${slug}/submissions`}
      >
        <XMarkIcon className="w-5 h-5" />
      </Link>
      <div className="mx-auto w-full sm:mx-auto sm:max-w-96">
        <NewSubmissionForm
          lng={lng}
          conferenceId={conference!.id}
          sections={conference!.sections}
        />
      </div>
    </div>
  );
}
