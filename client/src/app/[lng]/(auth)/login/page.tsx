import LoginForm from "./LoginForm";
import { FormMessage } from "@/components/Message";
import { Trans } from "react-i18next/TransWithoutContext";
import GoogleSignIn from "../GoogleSignin";
import { headers } from "next/headers";
import { translate } from "@/lib/i18n";

export default async function LoginPage({
  params: { lng },
  searchParams: { url },
}: {
  params: { lng: string };
  searchParams: { url?: string };
}) {
  const { t } = await translate(lng, "login");

  const host = headers().get("host") || "localhost:3000";
  const subdomain = host.split(".")[0];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl text-center font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
        {t("heading")}
      </h2>

      <FormMessage />

      <LoginForm lng={lng} url={url} />

      {(subdomain.includes("conferences") ||
        subdomain === "localhost:3000") && (
        <div>
          <div className="relative flex py-6 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 font-light text-sm dark:text-white">
              {t("continue")}
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="flex justify-center pt-4">
            <GoogleSignIn />
          </div>
        </div>
      )}

      <p className="pt-10 text-center text-sm text-gray-500 dark:text-gray-300">
        <Trans
          i18nKey={"register"}
          t={t}
          components={{
            reg: (
              <a
                href={`/register${
                  url ? `?url=${encodeURIComponent(url)}` : ""
                }`}
                className="text-sm font-semibold text-primary-500 hover:text-primary-500/90 focus:outline-primary-500"
              />
            ),
          }}
        />
      </p>
    </div>
  );
}
