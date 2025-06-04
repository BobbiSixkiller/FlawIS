import Dropdown from "@/components/Dropdown";
import { getConference } from "../../actions";
import { EllipsisHorizontalIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Button from "@/components/Button";

export default async function TicketsPage({
  params: { lng, slug },
}: {
  params: { lng: string; slug: string };
}) {
  const conference = await getConference(slug);

  return (
    <div className="flex flex-col gap-2">
      <Button
        size="sm"
        as={Link}
        href={`/conferences/${slug}/tickets/new`}
        scroll={false}
        className="px-3 py-2 rounded-md max-w-fit bg-primary-500 hover:bg-primary-700 flex gap-2 items-center justify-center font-semibold text-white text-sm"
      >
        <PlusIcon className="h-5 w-5" />
        Novy
      </Button>
      <div className="-mx-6 sm:mx-0 divide-y dark:divide-gray-600">
        {conference?.tickets.map((t, i) => (
          <div
            className="p-6 sm:p-4 flex justify-between gap-4 text-gray-900 dark:text-white"
            key={i}
          >
            <div className="flex flex-col">
              <span className="text-lg">
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
                  type: "link",
                  href: `/conferences/${slug}/tickets/${t.id}/update`,
                  text: "Aktualizovat",
                },
                {
                  type: "link",
                  href: `/conferences/${slug}/tickets/${t.id}/delete`,
                  text: "Zmazat",
                },
              ]}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
