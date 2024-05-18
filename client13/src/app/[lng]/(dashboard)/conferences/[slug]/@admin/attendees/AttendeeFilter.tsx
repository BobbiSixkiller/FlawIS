"use client";

import Toggle from "@/components/Toggle";
import {
  ConferenceFragment,
  SectionFragment,
} from "@/lib/graphql/generated/graphql";
import { Popover, Transition } from "@headlessui/react";
import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Fragment } from "react";

export default function AttendeeFilter({
  sections,
  lng,
}: {
  sections: SectionFragment[];
  lng: string;
}) {
  const searchParams = useSearchParams();
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
          <Popover.Button
            className={` group flex items-center rounded-md bg-primary-500 focus:outline-primary-500 p-2 text-base font-medium text-white`}
          >
            {open ? (
              <XMarkIcon className="size-5" aria-hidden="true" />
            ) : (
              <FunnelIcon className="size-5" aria-hidden="true" />
            )}
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute z-10 p-3 w-screen max-w-[calc(100vw-3rem)] sm:max-w-sm mt-3 -left-20 mr-20 flex flex-col gap-1 rounded-lg shadow-lg ring-1 ring-black/5 bg-white overflow-y-auto h-fit max-h-48 text-sm">
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
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
