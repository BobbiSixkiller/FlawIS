import Dropdown from "@/components/Dropdown";
import { getConference } from "../../actions";
import { EllipsisHorizontalIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default async function TicketsPage({
  params: { lng, slug },
}: {
  params: { lng: string; slug: string };
}) {
  const conference = await getConference(slug);

  return (
    <div className="flex flex-col gap-2">
      <Link
        href={`/conferences/${slug}/tickets/new`}
        scroll={false}
        className="px-3 py-2 rounded-md max-w-fit bg-primary-500 hover:bg-primary-700 flex gap-2 items-center justify-center font-semibold text-white text-sm"
      >
        <PlusIcon className="h-5 w-5" />
        Novy
      </Link>
      <div className="-mx-6 sm:mx-0 divide-y">
        {conference.tickets.map((t, i) => (
          <div className="p-6 sm:p-4 flex justify-between gap-4" key={i}>
            <div className="flex flex-col">
              <span className="text-lg text-gray-900">
                {t.translations[lng as "sk" | "en"].name}
              </span>
              <span className="text-sm text-gray-400">
                {t.translations[lng as "sk" | "en"].description}
              </span>
            </div>
            <Dropdown
              trigger={<EllipsisHorizontalIcon className="h-5 w-5" />}
              items={[
                {
                  href: `/conferences/${slug}/tickets/${t.id}/update`,
                  label: "Aktualizovat",
                },
                {
                  href: `/conferences/${slug}/tickets/${t.id}/delete`,
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
