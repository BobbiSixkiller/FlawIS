import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import UpdateSubmissionForm from "./UpdateSubmissionForm";
import { getConference } from "@/app/[lng]/(dashboard)/conferences/actions";
import { redirect } from "next/navigation";
import { FormMessage } from "@/components/Message";
import { downloadFile } from "@/lib/minio";

export default async function UpdateSubmissionPage({
  params: { lng, slug, id },
}: {
  params: { lng: string; slug: string; id: string };
}) {
  const conference = await getConference(slug);
  const submission = conference.attending?.submissions.find((s) => s.id === id);
  if (!submission) {
    redirect(`/conferences/${slug}/submissions`);
  }

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
        <UpdateSubmissionForm
          lng={lng}
          submission={submission}
          sections={conference.sections}
        />
      </div>
    </div>
  );
}
