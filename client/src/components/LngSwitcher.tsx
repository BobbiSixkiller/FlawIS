"use client";

import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { Fragment } from "react";
import { languages } from "@/lib/i18n/settings";
import { useTranslation } from "@/lib/i18n/client";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/utils/helpers";

export default function LngSwitcher({
  lng,
  className,
  authLayout,
}: {
  lng: string;
  className?: string;
  authLayout?: boolean;
}) {
  const router = useRouter();
  const path = usePathname();

  const { t } = useTranslation(lng, "dashboard");

  return (
    <Menu as="div" className={cn("relative", className)}>
      <MenuButton
        className={cn([
          "h-fit w-full flex items-center",
          authLayout
            ? "rounded-full outline-none focus:ring-2 focus:ring-primary-500"
            : "py-3 px-4 rounded-lg hover:bg-primary-700 outline-none	focus:ring-2 focus:ring-inset focus:ring-white",
        ])}
      >
        <Image
          alt="Locale-flag"
          priority
          src={`/images/${lng}.svg`}
          width={authLayout ? 32 : 20}
          height={authLayout ? 32 : 20}
        />
        {!authLayout && <span className="ml-2">{t(lng)}</span>}{" "}
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
          anchor={{ gap: 10, to: authLayout ? "bottom end" : "top" }}
          className={cn([
            "dark:bg-gray-700 dark:text-white",
            "rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none",
            authLayout ? "w-fit" : "absolute w-[var(--button-width)] ",
          ])}
        >
          <div className="p-1">
            {languages.map((l, i) => (
              <MenuItem key={i}>
                {({ focus }) => (
                  <button
                    className={`${
                      focus ? "bg-primary-500 text-white" : ""
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm ${
                      l === lng ? "font-bold" : ""
                    }`}
                    onClick={() => {
                      router.replace(
                        `/${l}${path.replace("/en", "").replace("/sk", "")}`
                      );
                    }}
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
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
