import Button from "@/components/Button";
import Logo from "@/components/Logo";
import { translate } from "@/lib/i18n";
import {
  cookieName,
  fallbackLng,
  getSupportedLocale,
  localeHeaderName,
} from "@/lib/i18n/settings";
import { HomeIcon } from "@heroicons/react/24/outline";
import { cookies, headers } from "next/headers";
import Link from "next/link";

export default async function NotFound() {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const lng =
    getSupportedLocale(headerStore.get(localeHeaderName)) ??
    getSupportedLocale(cookieStore.get(cookieName)?.value) ??
    fallbackLng;
  const { t } = await translate(lng, ["common", "landing"]);

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 dark:bg-gray-900">
      <div>
        <Logo lng={lng} height={60} width={60} />
      </div>
      <h1 className="text-2xl dark:text-white/85">
        {t("notFoundMsg", { ns: "common" })}
      </h1>
      <Button as={Link} href="/" className="rounded-full">
        <HomeIcon className="h-5 w-5" />
        {t("home", { ns: "common" })}
      </Button>
    </div>
  );
}
