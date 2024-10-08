import LoginForm from "./LoginForm";
import { useTranslation } from "@/lib/i18n";
import { FormMessage } from "@/components/Message";
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
    <div className="mt-6 flex flex-col gap-4">
      <h2 className="text-2xl text-center font-bold leading-9 tracking-tight text-gray-900">
        {t("heading")}
      </h2>

      <FormMessage lng={lng} />

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
