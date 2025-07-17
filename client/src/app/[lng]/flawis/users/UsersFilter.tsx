"use client";

import Button from "@/components/Button";
import Toggle from "@/components/Toggle";
import { Access } from "@/lib/graphql/generated/graphql";
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

export default function UsersFilter({ access }: { access: Access[] }) {
  const searchParams = useSearchParams();
  const { lng } = useParams<{ lng: string }>();
  const pathname = usePathname();
  const { replace } = useRouter();

  function handleAccess(access: string) {
    const params = new URLSearchParams(searchParams);

    // Get all current accesses
    const currentAccesses = params.getAll("access");

    if (currentAccesses.includes(access)) {
      // If the access already exists, create a new list excluding the current access
      const newIds = currentAccesses.filter(
        (currAccess) => currAccess !== access
      );
      // Clear the existing 'access' entries
      params.delete("access");
      // Append back all accesses except the one to remove
      newIds.forEach((newId) => params.append("access", newId));
    } else {
      // Append the new access if it doesn't exist
      params.append("access", access);
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
                "absolute z-10 p-3 w-screen max-w-[calc(100vw-3rem)] sm:max-w-sm mt-3 flex flex-col gap-1 rounded-lg shadow-lg ring-1 ring-black/5 bg-white text-gray-900 overflow-y-auto h-fit max-h-48 text-sm",
                "dark:bg-gray-700 dark:text-white",
              ])}
            >
              {access.map((a) => (
                <div className="flex items-center justify-between" key={a}>
                  {a}
                  <Toggle
                    defaultChecked={searchParams.getAll("access").includes(a)}
                    handleToggle={() => handleAccess(a)}
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
