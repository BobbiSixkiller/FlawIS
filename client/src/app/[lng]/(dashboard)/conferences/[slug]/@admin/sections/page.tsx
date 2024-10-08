import Dropdown from "@/components/Dropdown";
import { EllipsisHorizontalIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { conferenceSections } from "./actions";

export default async function SectionsPage({
  params: { lng, slug },
}: {
  params: { lng: string; slug: string };
}) {
  const conference = await conferenceSections({
    slug,
    first: 1000,
  });

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
        <div className="flex flex-col sm:flex-row gap-2 p-6 sm:p-4 sm:items-center">
          <div className="w-3/4">Nazov</div>
          <div>Nahrate prispevky</div>
        </div>
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
                {s.submissions.edges.reduce((acc, edge) => {
                  if (edge?.node.fileUrl) {
                    return acc + 1;
                  } else return acc;
                }, 0)}{" "}
                / {s.submissions.totalCount}
              </span>
            </div>

            <span className="whitespace-nowrap hidden sm:block">
              {s.submissions.edges.reduce((acc, edge) => {
                if (edge?.node.fileUrl) {
                  return acc + 1;
                } else return acc;
              }, 0)}{" "}
              / {s.submissions.totalCount}
            </span>

            <Dropdown
              trigger={<EllipsisHorizontalIcon className="h-5 w-5" />}
              items={[
                {
                  href: `/conferences/${slug}/sections/${s.id}/update`,
                  label: "Aktualizovat",
                },
                {
                  href: `/minio?bucketName=${
                    s.conference?.slug
                  }${s.submissions.edges.map((sub) => {
                    if (sub?.node.fileUrl) {
                      return `&objectName=${sub.node.fileUrl}`;
                    }
                  })}`,
                  label: "Prispevky.zip",
                },
                {
                  href: `/conferences/${slug}/sections/${s.id}/delete`,
                  label: "Zmazat",
                },
              ]}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
