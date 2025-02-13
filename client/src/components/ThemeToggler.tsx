"use client";

import { setDarkThemeCookie } from "@/utils/actions";
import { cn } from "@/utils/helpers";
import { Switch } from "@headlessui/react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

export default function ThemeToggler({ dark }: { dark: boolean }) {
  useEffect(() => {
    if (dark) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [dark]);

  return (
    <Switch
      checked={dark}
      onChange={setDarkThemeCookie}
      className={cn([
        "group relative flex h-9 w-16 cursor-pointer rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none data-[focus]:outline-1",
        dark
          ? "bg-white/10 data-[focus]:outline-white data-[checked]:bg-white/10"
          : "bg-primary-500/10 data-[focus]:outline-primary-500 data-[checked]:bg-primary-500/10",
      ])}
    >
      <span
        aria-hidden="true"
        className={cn([
          "pointer-events-none p-1 flex items-center justify-center translate-x-0 rounded-full bg-white ring-0 shadow-lg transition duration-200 ease-in-out group-data-[checked]:translate-x-7",
        ])}
      >
        {dark ? (
          <MoonIcon className="size-5" />
        ) : (
          <SunIcon className="size-5" />
        )}
      </span>
    </Switch>
  );
}
