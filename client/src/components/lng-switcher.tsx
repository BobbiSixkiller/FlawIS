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
import Dropdown from "./dropdown";
import Link from "next/link";

function saveLocalePreference(lng: string) {
  const { hostname, protocol } = window.location;
  const cookieDomain = getLocaleCookieDomain(hostname);
  const domain = cookieDomain ? `; Domain=${cookieDomain}` : "";
  const secure = protocol === "https:" ? "; Secure" : "";

  document.cookie = `${cookieName}=${encodeURIComponent(lng)}; Path=/; Max-Age=${localePreferenceMaxAge}; SameSite=Lax${domain}${secure}`;
}

export default function LngSwitcher({ authLayout }: { authLayout?: boolean }) {
  const path = usePathname();
  const { lng } = useParams<{ lng: string }>();

  const { t } = useTranslation(lng, "dashboard");

  return (
    <Dropdown
      anchor={{ gap: 6, to: authLayout ? "bottom end" : "top" }}
      buttonWidth={!authLayout}
      triggerProps={
        authLayout
          ? { size: "icon", variant: "ghost", className: "rounded-full", "aria-label": t(lng) }
          : { variant: "ghost", className: "min-w-0 flex-1 justify-start" }
      }
      trigger={
        authLayout ? (
          <Image
            alt=""
            priority
            src={`/images/${lng}.svg`}
            width={36}
            height={36}
          />
        ) : (
          <>
            <Image
              alt=""
              priority
              src={`/images/${lng}.svg`}
              width={20}
              height={20}
            />
            <span className="ml-2 text-foreground">{t(lng)}</span>
          </>
        )
      }
      items={languages.map((l) => (
        <Link
          key={l}
          href={getLocalizedPath(path, l)}
          prefetch={false}
          onNavigate={() => saveLocalePreference(l)}
        >
          <Image
            alt=""
            priority
            src={`/images/${l}.svg`}
            width={20}
            height={20}
            className="mr-2"
          />
          {t(l)}
        </Link>
      ))}
    />
  );
}
