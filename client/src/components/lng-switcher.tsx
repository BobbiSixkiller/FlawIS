"use client";

import {
  cookieName,
  getLocaleCookieDomain,
  getLocalizedPath,
  languages,
  localePreferenceMaxAge,
} from "@/lib/i18n/settings";
import { useTranslation } from "@/hooks/use-translation";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

function saveLocalePreference(lng: string) {
  const { hostname, protocol } = window.location;
  const cookieDomain = getLocaleCookieDomain(hostname);
  const domain = cookieDomain ? `; Domain=${cookieDomain}` : "";
  const secure = protocol === "https:" ? "; Secure" : "";

  document.cookie = `${cookieName}=${encodeURIComponent(lng)}; Path=/; Max-Age=${localePreferenceMaxAge}; SameSite=Lax${domain}${secure}`;
}

export default function LngSwitcher() {
  const path = usePathname();
  const { lng } = useParams<{ lng: string }>();

  const { t } = useTranslation(lng, "dashboard");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t(lng)}
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            className="rounded-full border-0"
          />
        }
      >
        <Image
          alt=""
          priority
          src={`/images/${lng}.svg`}
          width={36}
          height={36}
          className="size-full rounded-full"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((locale) => (
          <DropdownMenuItem
            key={locale}
            nativeButton={false}
            className="min-h-11 gap-2 px-3 py-2"
            render={
              <Link
                href={getLocalizedPath(path, locale)}
                prefetch={false}
                onNavigate={() => saveLocalePreference(locale)}
              />
            }
          >
            <Image
              alt=""
              priority
              src={`/images/${locale}.svg`}
              width={20}
              height={20}
            />
            {t(locale)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
