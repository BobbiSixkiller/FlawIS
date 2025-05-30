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
import { useParams, usePathname, useRouter } from "next/navigation";
import { cn } from "@/utils/helpers";
import Dropdown from "./Dropdown";
import Button from "./Button";

export default function LngSwitcher({
  className,
  authLayout,
}: {
  className?: string;
  authLayout?: boolean;
}) {
  const router = useRouter();
  const path = usePathname();
  const { lng } = useParams<{ lng: string }>();

  const { t } = useTranslation(lng, "dashboard");

  return (
    <Dropdown
      className="w-full"
      positionSettings={authLayout ? "mt-2 right-0" : "inset-x-0 -top-24"}
      trigger={
        authLayout ? (
          <Button size="icon" variant="ghost" className="rounded-full">
            <Image
              alt="Locale-flag"
              priority
              src={`/images/${lng}.svg`}
              width={36}
              height={36}
            />
          </Button>
        ) : (
          <Button variant="ghost" className="w-full justify-start">
            <Image
              alt="Locale-flag"
              priority
              src={`/images/${lng}.svg`}
              width={20}
              height={20}
            />
            <span className="ml-2 text-white dark:text-white/85">{t(lng)}</span>
          </Button>
        )
      }
      items={languages.map((l) => ({
        icon: (
          <Image
            alt="Locale-flag"
            priority
            src={`/images/${l}.svg`}
            width={20}
            height={20}
            className="mr-2"
          />
        ),
        href: `/${l}${path.replace("/en", "").replace("/sk", "")}`,
        text: t(l),
      }))}
    />
  );

  return (
    <Menu as="div" className={cn("relative", className)}>
      <MenuButton
        className={cn([
          "h-fit w-full flex items-center data-[open]:bg-primary-700 dark:data-[open]:bg-gray-700 dark:hover:bg-white/30",
          authLayout
            ? "rounded-full outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 dark:focus:ring-primary-300"
            : "py-3 px-4 rounded-lg hover:bg-primary-700 outline-none	focus:ring-2 focus:ring-inset focus:ring-white text-white",
        ])}
      >
        <Image
          alt="Locale-flag"
          priority
          src={`/images/${lng}.svg`}
          width={authLayout ? 32 : 20}
          height={authLayout ? 32 : 20}
        />
        {!authLayout && (
          <span className="ml-2 dark:text-white/85">{t(lng)}</span>
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
