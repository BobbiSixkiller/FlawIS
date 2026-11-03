import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { translate } from "@/lib/i18n";
import {
  cookieName,
  fallbackLng,
  getSupportedLocale,
  localeHeaderName,
} from "@/lib/i18n/settings";
import Icon from "@/components/icon";
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
    <div className="h-screen flex flex-col items-center justify-center gap-6 dark:bg-card">
      <div>
        <Logo lng={lng} height={60} width={60} />
      </div>
      <h1 className="text-2xl dark:text-foreground">
        {t("notFoundMsg", { ns: "common" })}
      </h1>
      <Button
        className="rounded-full"
        nativeButton={false}
        role="link"
        render={<Link href="/" />}
      >
        <Icon name="home" className="h-5 w-5" />
        {t("home", { ns: "common" })}
      </Button>
    </div>
  );
}
