"use client";

import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { languages } from "@/lib/i18n/settings";
import { GlobeAltIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "@/lib/i18n/client";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

export default function LngSwitcher({
  lng,
  mobile,
}: {
  lng: string;
  mobile?: boolean;
}) {
  const router = useRouter();
  const path = usePathname();

  const { t } = useTranslation(lng, "landing");

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        className={`h-full w-full ${
          mobile
            ? "px-2 py-1 rounded-md hover:bg-gray-700 hover:bg-opacity-10 outline-none	focus:ring-2 focus:ring-inset focus:ring-primary-500"
            : "py-3 px-4 rounded-lg hover:bg-primary-700 outline-none	focus:ring-2 focus:ring-inset focus:ring-white"
        } flex items-center`}
      >
        <GlobeAltIcon className="h-5 w-5 lg:mr-2" />
        <span className="hidden lg:block">{t(lng)}</span>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={`absolute ${
            mobile
              ? "right-0 mt-2 min-w-max w-32 origin-top-right"
              : "inset-x-0 -top-24"
          } rounded-md bg-white shadow-lg divide-y divide-gray-100 ring-1 ring-black/5 focus:outline-none`}
        >
          <div className="p-1">
            {languages.map((l, i) => (
              <Menu.Item key={i}>
                {({ active }) => (
                  <button
                    className={`${
                      active ? "bg-primary-500 text-white" : "text-gray-900"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm ${
                      l === lng ? "font-bold" : ""
                    }`}
                    onClick={() =>
                      router.replace(
                        `/${l}${path.replace("/sk", "").replace("/en", "")}`
                      )
                    }
                  >
                    <Image
                      alt="Locale-flag"
                      priority
                      src={`/images/${l}.svg`}
                      width={20}
                      height={20}
                      className="mr-2"
                    />
                    {t(l)}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
