import { Trans } from "react-i18next/TransWithoutContext";
import GoogleSignIn from "../google-signin";
import UserForm from "./user-form";
import { translate } from "@/lib/i18n";
import { cn } from "@/lib/utilsClient";
import { FormMessage } from "@/components/message";
import Link from "next/link";
import { getSubdomain } from "@/lib/utilsServer";

export default async function Register({
  params,
  searchParams,
}: {
  params: Promise<{ lng: string }>;
  searchParams: Promise<{ url?: string }>;
}) {
  const { lng } = await params;
  const { url } = await searchParams;
  const { t } = await translate(lng, "register");

  const subdomain = await getSubdomain();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl text-center font-bold leading-9 tracking-tight text-foreground dark:text-foreground">
        {t("heading")}
      </h1>

      <FormMessage />

      <UserForm subdomain={subdomain} namespace="register" />

      {(subdomain.includes("conferences") || subdomain.includes("courses")) && (
        <div>
          <div className="relative flex py-6 items-center">
            <div className="grow border-t border-border"></div>
            <span className="shrink mx-4 font-light text-sm">
              {t("continue")}
            </span>
            <div className="grow border-t border-border"></div>
          </div>

          <div className="flex justify-center pt-4">
            <GoogleSignIn />
          </div>
        </div>
      )}

      <p className="mt-10 text-center text-sm text-muted-foreground dark:text-muted-foreground">
        <Trans
          i18nKey={"login"}
          t={t}
          components={{
            login: (
              <Link
                key={"login"}
                href={`/login${url ? `?url=${encodeURIComponent(url)}` : ""}`}
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
