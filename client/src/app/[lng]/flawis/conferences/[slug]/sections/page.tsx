import Dropdown from "@/components/Dropdown";
import { EllipsisHorizontalIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { conferenceSections } from "./actions";
import { SubmissionFilesFragment } from "@/lib/graphql/generated/graphql";

export default async function SectionsPage({
  params: { lng, slug },
}: {
  params: { lng: string; slug: string };
}) {
  const conference = await conferenceSections({
    slug,
    first: 1000,
  });

  function countFiles(submissions: SubmissionFilesFragment) {
    return submissions.edges?.reduce((acc, edge) => {
      if (edge?.node.fileUrl) {
        return acc + 1;
      } else return acc;
    }, 0);
  }

  return (
    <div className="flex flex-col gap-2">
      <Link
        href={`/conferences/${slug}/sections/new`}
        scroll={false}
        className="px-3 py-2 rounded-md max-w-fit bg-primary-500 hover:bg-primary-700 flex gap-2 items-center justify-center font-semibold text-white text-sm"
      >
        <PlusIcon className="h-5 w-5" />
        Nova
      </Link>
      <div className="-mx-6 sm:mx-0 divide-y">
        {conference?.sections.map((s, i) => (
          <div
            className="p-6 sm:p-4 flex justify-between sm:items-center gap-4"
            key={i}
          >
            <div className="flex flex-col w-3/4">
              <span className="text-lg text-gray-900">
                {s.translations[lng as "sk" | "en"].name}
              </span>
              <span className="text-sm text-gray-400">
                {s.translations[lng as "sk" | "en"].topic}
              </span>
              <span className="whitespace-nowrap sm:hidden text-sm">
                {countFiles(s.submissions)}/ {s.submissions.totalCount}
              </span>
            </div>

            <span className="whitespace-nowrap hidden sm:block">
              {countFiles(s.submissions)} / {s.submissions.totalCount}
            </span>

            <Dropdown
              trigger={<EllipsisHorizontalIcon className="h-5 w-5" />}
              items={
                countFiles(s.submissions) > 0
                  ? [
                      {
                        href: `/conferences/${slug}/sections/${s.id}/update`,
                        label: "Aktualizovat",
                      },
                      {
                        href: `/minio?bucketName=${s.conference?.slug}${
                          s.submissions.edges
                            .map((sub) =>
                              sub?.node.fileUrl
                                ? `&url=${sub.node.fileUrl}`
                                : null
                            ) // Return null for invalid entries
                            .filter(Boolean) // Filter out null values
                            .join("") // Join without adding commas
                        }`,
                        label: "Prispevky.zip",
                      },
                      {
                        href: `/conferences/${slug}/sections/${s.id}/delete`,
                        label: "Zmazat",
                      },
                    ]
                  : [
                      {
                        href: `/conferences/${slug}/sections/${s.id}/update`,
                        label: "Aktualizovat",
                      },
                      {
                        href: `/conferences/${slug}/sections/${s.id}/delete`,
                        label: "Zmazat",
                      },
                    ]
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
