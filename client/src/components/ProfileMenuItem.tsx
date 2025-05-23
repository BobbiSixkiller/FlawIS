"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { Fragment } from "react";
import {
  ArrowLeftCircleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { UserFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import DynamicImageClient from "./DynamicImageClient";
import { cn } from "@/utils/helpers";

export function ProfileMenuItem({ user }: { user?: UserFragment }) {
  const router = useRouter();
  const path = usePathname();
  const { lng } = useParams<{ lng: string }>();

  const { t } = useTranslation(lng, "dashboard");

  return (
    <Menu as="div" className="relative h-fit my-auto lg:m-0">
      <MenuButton
        className={cn([
          "h-fit w-full rounded-full outline-none focus:ring-2 focus:ring-primary-500 flex items-center",
        ])}
      >
        {user?.avatarUrl ? (
          <DynamicImageClient
            src={user.avatarUrl}
            alt="Avatar"
            className="size-8 md:size-10 rounded-full"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <UserCircleIcon className="size-5" />
        )}
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems
          className={cn([
            "w-fit absolute rounded-md bg-white shadow-lg divide-y divide-gray-100 ring-1 ring-black/5 focus:outline-none text-gray-900",
            "dark:bg-gray-700 dark:text-white/85",
            "right-0 mt-2 min-w-max w-32 origin-top-right",
          ])}
        >
          <div className="p-1">
            <MenuItem>
              {({ focus }) => (
                <button
                  className={`${
                    focus ? "bg-primary-500 text-white" : ""
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm ${
                    path.includes("/profile") ? "font-bold" : ""
                  }`}
                  onClick={() => router.push(`/profile`)}
                >
                  <UserCircleIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                  {t("profile")}
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  className={`${
                    focus ? "bg-primary-500 text-white" : ""
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  onClick={() => router.push("/logout")}
                >
                  <ArrowLeftCircleIcon
                    className="mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  {t("logout")}
                </button>
              )}
            </MenuItem>
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
