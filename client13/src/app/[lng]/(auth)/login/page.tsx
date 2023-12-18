import Logo from "@/components/Logo";
import LoginForm from "./LoginForm";
import { useTranslation } from "@/lib/i18n";
import { Trans } from "react-i18next/TransWithoutContext";

export default async function Login({
  params: { lng },
  searchParams: { url },
}: {
  params: { lng: string };
  searchParams: { url?: string };
}) {
  const { t } = await useTranslation(lng, "login");

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-sm flex min-h-full flex-1 gap-4 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="flex flex-col gap-10">
        <Logo lng={lng} width={60} height={60} notext />

        <h2 className="text-2xl text-center font-bold leading-9 tracking-tight text-gray-900">
          {t("heading")}
        </h2>
      </div>

      <div>
        <LoginForm lng={lng} url={url} />

        <p className="mt-10 text-center text-sm text-gray-500">
          <Trans
            i18nKey={"register"}
            t={t}
            components={{
              reg: (
                <a
                  href={`/register${
                    url ? `?url=${encodeURIComponent(url)}` : ""
                  }`}
                  className="text-sm font-semibold text-primary-500 hover:text-primary-700 focus:outline-primary-500"
                />
              ),
            }}
          />
        </p>
      </div>
    </div>
  );
}
