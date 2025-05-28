"use client";

import { setDarkThemeCookie } from "@/utils/actions";
import { cn } from "@/utils/helpers";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import Button from "./Button";

export default function ThemeToggler({
  dark,
  authLayout,
}: {
  dark: boolean;
  authLayout?: boolean;
}) {
  useEffect(() => {
    if (dark) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [dark]);

  return (
    <Button
      variant={"ghost"}
      size="icon"
      className={cn([
        "rounded-full p-2 text-white",
        authLayout && "bg-primary-500 hover:bg-primary-500/90 dark:bg-white/10",
      ])}
      onClick={() => setDarkThemeCookie(!dark)}
    >
      {dark ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
    </Button>
  );
}
