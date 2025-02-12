import { Trans } from "react-i18next/TransWithoutContext";
import { headers } from "next/headers";
import GoogleSignIn from "../GoogleSignin";
import UserForm from "./UserForm";
import { translate } from "@/lib/i18n";

export default async function Register({
  params: { lng },
  searchParams: { url },
}: {
  params: { lng: string };
  searchParams: { url?: string };
}) {
  const { t } = await translate(lng, "register");

  const host = headers().get("host") || ""; // Get the hostname from the request
  const subdomain = host.split(".")[0]; // Parse the subdomain (assuming subdomain is the first part)

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl text-center font-bold leading-9 tracking-tight text-gray-900">
        {t("heading")}
      </h2>

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

      <p className="mt-10 text-center text-sm text-gray-500">
        <Trans
          i18nKey={"login"}
          t={t}
          components={{
            login: (
              <a
                href={`/login${url ? `?url=${encodeURIComponent(url)}` : ""}`}
                className="text-sm font-semibold text-primary-500 hover:text-primary-700 focus:outline-primary-500"
              />
            ),
          }}
        />
      </p>
    </div>
  );
}
