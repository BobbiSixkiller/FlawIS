import LoginForm from "./login-form";
import { FormMessage } from "@/components/message";
import { Trans } from "react-i18next/TransWithoutContext";
import GoogleSignIn from "../google-signin";
import { translate } from "@/lib/i18n";
import { cn } from "@/lib/utilsClient";
import Link from "next/link";
import { getSubdomain } from "@/lib/utilsServer";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ lng: string }>;
  searchParams: Promise<{ url?: string }>;
}) {
  const { lng } = await params;
  const { url } = await searchParams;
  const { t } = await translate(lng, "login");

  const subdomain = await getSubdomain();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl text-center font-bold leading-9 tracking-tight text-foreground dark:text-foreground">
        {t("heading")}
      </h1>

      <FormMessage />

      <LoginForm lng={lng} url={url} />

      {(subdomain.includes("conferences") ||
        subdomain.includes("courses") ||
        subdomain === "localhost:3000") && (
        <div>
          <div className="relative flex py-6 items-center">
            <div className="grow border-t border-border dark:border-border"></div>
            <span className="shrink mx-4 font-light text-sm dark:text-foreground">
              {t("continue")}
            </span>
            <div className="grow border-t border-border dark:border-border"></div>
          </div>

          <div className="flex justify-center pt-4">
            <GoogleSignIn />
          </div>
        </div>
      )}

      <p className="pt-10 text-center text-sm text-muted-foreground dark:text-foreground">
        <Trans
          i18nKey={"register"}
          t={t}
          components={{
            reg: (
              <Link
                key={"reg"}
                href={`/register${
                  url ? `?url=${encodeURIComponent(url)}` : ""
                }`}
                className={cn([
                  "text-sm font-semibold text-primary hover:text-primary/90 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "dark:text-primary dark:hover:text-primary/90 dark:focus:ring-offset-background dark:focus:ring-ring",
                ])}
              />
            ),
          }}
        />
      </p>
    </div>
  );
}
