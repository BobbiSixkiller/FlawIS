import { useTranslation } from "@/lib/i18n";
import { Trans } from "react-i18next/TransWithoutContext";
import Logo from "@/components/Logo";
import RegisterForm from "./RegisterForm";

export default async function Register({
  params: { lng },
  searchParams: { url },
}: {
  params: { lng: string };
  searchParams: { url?: string };
}) {
  const { t } = await useTranslation(lng, "register");

  return (
    <div className="mt-6 flex flex-col gap-4">
      <h2 className="text-2xl text-center font-bold leading-9 tracking-tight text-gray-900">
        {t("heading")}
      </h2>

      <div>
        <RegisterForm lng={lng} url={url} />

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
    </div>
  );
}
