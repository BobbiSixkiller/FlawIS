"use client";

import {
  cookieName,
  getLocaleCookieDomain,
  getLocalizedPath,
  languages,
  localePreferenceMaxAge,
} from "@/lib/i18n/settings";
import { useTranslation } from "@/lib/i18n/client";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import Icon from "./icon";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SidebarMenuButton } from "./ui/sidebar";

function saveLocalePreference(lng: string) {
  const { hostname, protocol } = window.location;
  const cookieDomain = getLocaleCookieDomain(hostname);
  const domain = cookieDomain ? `; Domain=${cookieDomain}` : "";
  const secure = protocol === "https:" ? "; Secure" : "";

  document.cookie = `${cookieName}=${encodeURIComponent(lng)}; Path=/; Max-Age=${localePreferenceMaxAge}; SameSite=Lax${domain}${secure}`;
}

export default function LngSwitcher({
  variant = "compact",
}: {
  variant?: "compact" | "sidebar";
}) {
  const path = usePathname();
  const { lng } = useParams<{ lng: string }>();

  const { t } = useTranslation(lng, "dashboard");
  const isMobile = useIsMobile();
  const inSidebar = variant === "sidebar";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t(lng)}
        render={
          inSidebar ? (
            <SidebarMenuButton className="h-9" />
          ) : (
            <Button variant="ghost" size="icon" className="rounded-full" />
          )
        }
      >
        <Image
          alt=""
          priority
          src={`/images/${lng}.svg`}
          width={inSidebar ? 16 : 36}
          height={inSidebar ? 16 : 36}
          className="shrink-0"
        />
        {inSidebar && (
          <>
            <span className="group-data-[collapsible=icon]:sr-only">
              {t(lng)}
            </span>
            <Icon
              name="chevron-right"
              className="ml-auto group-data-[collapsible=icon]:hidden"
              aria-hidden="true"
            />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={inSidebar && !isMobile ? "right" : "bottom"}
        align="end"
        sideOffset={4}
        className="w-max min-w-44"
      >
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
