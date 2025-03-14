"use client";

import Button from "@/components/Button";
import Toggle from "@/components/Toggle";
import { SectionFragment } from "@/lib/graphql/generated/graphql";
import { cn } from "@/utils/helpers";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { Fragment } from "react";

export default function AttendeeFilter({
  sections,
}: {
  sections: SectionFragment[];
}) {
  const searchParams = useSearchParams();
  const { lng } = useParams<{ lng: string }>();
  const pathname = usePathname();
  const { replace } = useRouter();

  function handlePassive() {
    const params = new URLSearchParams(searchParams);

    if (searchParams.has("passive")) {
      params.delete("passive");
    } else {
      params.set("passive", "true");
    }

    replace(`${pathname}?${params.toString()}`);
  }

  function handleSection(id: string) {
    const params = new URLSearchParams(searchParams);

    // Get all current sectionIds
    const currentIds = params.getAll("sectionId");

    if (currentIds.includes(id)) {
      // If the id already exists, create a new list excluding the current id
      const newIds = currentIds.filter((currentId) => currentId !== id);
      // Clear the existing 'sectionId' entries
      params.delete("sectionId");
      // Append back all ids except the one to remove
      newIds.forEach((newId) => params.append("sectionId", newId));
    } else {
      // Append the new id if it doesn't exist
      params.append("sectionId", id);
    }

    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <PopoverButton as={Button} size="small" className="p-2">
            {open ? (
              <XMarkIcon className="size-5" aria-hidden="true" />
            ) : (
              <FunnelIcon className="size-5" aria-hidden="true" />
            )}
          </PopoverButton>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <PopoverPanel
              className={cn([
                "absolute z-10 p-3 w-screen max-w-[calc(100vw-3rem)] sm:max-w-sm mt-3 -left-20 mr-20 flex flex-col gap-1 rounded-lg shadow-lg ring-1 ring-black/5 bg-white text-gray-900 overflow-y-auto h-fit max-h-48 text-sm",
                "dark:bg-gray-700 dark:text-white",
              ])}
            >
              <div className="flex items-center justify-between">
                Pasivny ucastnici
                <Toggle
                  defaultChecked={searchParams.get("passive") === "true"}
                  handleToggle={handlePassive}
                />
              </div>

              {sections.map((s) => (
                <div className="flex items-center justify-between" key={s.id}>
                  {s.translations[lng as "sk" | "en"].name}
                  <Toggle
                    defaultChecked={searchParams
                      .getAll("sectionId")
                      .includes(s.id)}
                    handleToggle={() => handleSection(s.id)}
                  />
                </div>
              ))}
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
