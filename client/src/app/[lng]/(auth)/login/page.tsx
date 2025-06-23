import LoginForm from "./LoginForm";
import { FormMessage } from "@/components/Message";
import { Trans } from "react-i18next/TransWithoutContext";
import GoogleSignIn from "../GoogleSignin";
import { headers } from "next/headers";
import { translate } from "@/lib/i18n";
import { cn } from "@/utils/helpers";
import Link from "next/link";

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

  const headerStore = await headers();
  const host = headerStore.get("host") || "localhost:3000";
  const subdomain = host.split(".")[0];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl text-center font-bold leading-9 tracking-tight text-gray-900 dark:text-white/85">
        {t("heading")}
      </h2>

      <FormMessage />

      <LoginForm lng={lng} url={url} />

      {(subdomain.includes("conferences") ||
        subdomain === "localhost:3000") && (
        <div>
          <div className="relative flex py-6 items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span className="flex-shrink mx-4 font-light text-sm dark:text-white/85">
              {t("continue")}
            </span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          <div className="flex justify-center pt-4">
            <GoogleSignIn />
          </div>
        </div>
      )}

      <p className="pt-10 text-center text-sm text-gray-500 dark:text-white/85">
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
                  "text-sm font-semibold text-primary-500 hover:text-primary-500/90 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                  "dark:text-primary-300 dark:hover:text-primary-200 dark:focus:ring-offset-gray-900 dark:focus:ring-primary-300",
                ])}
              />
            ),
          }}
        />
      </p>
    </div>
  );
}
