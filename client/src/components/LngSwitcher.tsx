"use client";

import { languages } from "@/lib/i18n/settings";
import { useTranslation } from "@/lib/i18n/client";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import Dropdown from "./Dropdown";
import Button from "./Button";

export default function LngSwitcher({
  authLayout,
}: {
  className?: string;
  authLayout?: boolean;
}) {
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
        type: "link",
      }))}
    />
  );
}
