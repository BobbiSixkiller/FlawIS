import { redirect } from "next/navigation";
import Link from "next/link";
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { capitalizeFirstLetter } from "@/utils/helpers";
import { getConference } from "@/app/[lng]/flawis/conferences/actions";
import { translate } from "@/lib/i18n";
import Tooltip from "@/components/Tooltip";

export default async function AttendeeSubmissionsPage({
  params: { slug, lng },
}: {
  params: { slug: string; lng: string };
}) {
  const { t } = await translate(lng, ["common", "conferences"]);

  const conference = await getConference(slug);
  if (conference && !conference.attending?.ticket.withSubmission) {
    redirect(`/${slug}`);
  }

  return (
    <div className="flex flex-col gap-4">
      {conference.dates.submissionDeadline &&
        new Date(conference.dates.submissionDeadline) > new Date() && (
          <Link
            href={`/${slug}/submissions/new`}
            scroll={false}
            className="p-2 rounded-md bg-green-500 hover:bg-green-700 text-white flex justify-center items-center gap-2 sm:max-w-fit"
          >
            <PlusIcon className="w-5 h-5 stroke-2" />
            {t("new")}
          </Link>
        )}
      {conference?.attending?.submissions.map((s) => (
        <div
          key={s.id}
          className="rounded-2xl border dark:border-gray-700 p-4 shadow text-gray-900 text-sm focus:outline-primary-500 dark:text-white bg-white dark:bg-gray-700"
        >
          <h2 className="font-medium leading-6">
            {capitalizeFirstLetter(s.translations[lng as "sk" | "en"].name)}
          </h2>
          <p className="leading-none text-gray-500 dark:text-gray-300">
            {s.section.translations[lng as "sk" | "en"].name}
          </p>
          <ul className="mt-2 flex gap-1">
            {s.authors.map((a) => (
              <li key={a.id}>{a.name}</li>
            ))}
          </ul>
          <p>{s.translations[lng as "sk" | "en"].abstract}</p>
          <p>{s.translations[lng as "sk" | "en"].keywords.join(" • ")}</p>
          {conference.dates.submissionDeadline &&
            new Date(conference.dates.submissionDeadline) > new Date() && (
              <div className="mt-4 flex gap-2">
                <Tooltip
                  position="below"
                  message={t("editSubmission", { ns: "conferences" })}
                >
                  <Link
                    href={`/${slug}/submissions/${s.id}/update`}
                    scroll={false}
                    className="p-2 rounded-md bg-primary-500 hover:bg-primary-700 text-white flex justify-center items-center gap-2 sm:max-w-fit"
                  >
                    <PencilIcon className="size-4 stroke-2" />
                  </Link>
                </Tooltip>

                <Link
                  href={`/${slug}/submissions/${s.id}/delete`}
                  scroll={false}
                  className="p-2 rounded-md bg-red-500 hover:bg-red-700 text-white flex justify-center items-center gap-2 sm:max-w-fit"
                >
                  <TrashIcon className="size-4 stroke-2" />
                </Link>
              </div>
            )}
        </div>
      ))}
    </div>
  );
}
