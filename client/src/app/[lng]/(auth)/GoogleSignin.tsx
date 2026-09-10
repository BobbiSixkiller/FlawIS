"use client";

import Icon from "@/components/Icon";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utilsClient";
import { googleOAuthHref } from "@/lib/authRedirect";

export default function GoogleSignIn() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url")?.toString();

  return (
    <a
      href={googleOAuthHref(url)}
      className={cn([
        "text-sm rounded-md border border-gray-300 hover:border-primary-500 text-gray-900 px-3.5 py-2 w-32 flex gap-2 justify-center items-center focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        "dark:border-gray-600 dark:bg-slate-800 dark:text-white/85 dark:hover:border-primary-300 dark:focus:ring-primary-300 dark:focus:ring-offset-gray-900",
      ])}
    >
      <Icon name="google" x="0px" y="0px" width="30" height="30" />
      Google
    </a>
  );
}
