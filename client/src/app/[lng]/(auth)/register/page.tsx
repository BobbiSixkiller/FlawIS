import { Trans } from "react-i18next/TransWithoutContext";
import { headers } from "next/headers";
import GoogleSignIn from "../GoogleSignin";
import UserForm from "./UserForm";
import { translate } from "@/lib/i18n";
import { cn } from "@/utils/helpers";
import { FormMessage } from "@/components/Message";
import Link from "next/link";

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

  const headerStore = await headers();
  const host = headerStore.get("host") || ""; // Get the hostname from the request
  const subdomain = host.split(".")[0]; // Parse the subdomain (assuming subdomain is the first part)

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl text-center font-bold leading-9 tracking-tight text-gray-900 dark:text-white/85">
        {t("heading")}
      </h2>

      <FormMessage />

      <UserForm subdomain={subdomain} namespace="register" />

      {subdomain.includes("conferences") && (
        <div>
          <div className="relative flex py-6 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 font-light text-sm">
              {t("continue")}
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="flex justify-center pt-4">
            <GoogleSignIn />
          </div>
        </div>
      )}

      <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-300">
        <Trans
          i18nKey={"login"}
          t={t}
          components={{
            login: (
              <Link
                key={"login"}
                href={`/login${url ? `?url=${encodeURIComponent(url)}` : ""}`}
                className={cn([
                  "text-sm font-semibold text-primary-500 hover:text-primary-500/90 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                  "dark:text-primary-300 dark:hover:text-primary-300/90 dark:focus:ring-offset-gray-900 dark:focus:ring-primary-300",
                ])}
              />
            ),
          }}
        />
      </p>
    </div>
  );
}
