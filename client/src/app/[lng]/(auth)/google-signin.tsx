"use client";

import Icon from "@/components/icon";
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
        "text-sm rounded-md border border-border hover:border-primary text-foreground px-3.5 py-2 w-32 flex gap-2 justify-center items-center focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "dark:border-border dark:bg-card dark:text-foreground dark:hover:border-primary dark:focus:ring-ring dark:focus:ring-offset-background",
      ])}
    >
      <Icon name="google" x="0px" y="0px" width="30" height="30" />
      Google
    </a>
  );
}
