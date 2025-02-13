"use client";

import { setDarkThemeCookie } from "@/utils/actions";
import { cn } from "@/utils/helpers";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import Button from "./Button";

export default function ThemeToggler({ dark }: { dark: boolean }) {
  useEffect(() => {
    if (dark) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [dark]);

  return (
    <Button
      type="button"
      className={cn([
        "rounded-full h-fit p-1.5 hover:bg-primary-700",
        dark && "bg-white/20 hover:bg-white/30",
      ])}
      onClick={() => setDarkThemeCookie(!dark)}
    >
      {dark ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
    </Button>
  );
}
