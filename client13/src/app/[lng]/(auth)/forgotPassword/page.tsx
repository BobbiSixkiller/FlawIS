import Logo from "@/components/Logo";
import { Trans } from "react-i18next/TransWithoutContext";
import Link from "next/link";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { useTranslation } from "@/lib/i18n";

export default async function ForgotPassword({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const { t } = await useTranslation(lng, "forgotPassword");

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-sm flex min-h-full flex-1 gap-4 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="flex flex-col gap-10">
        <Logo lng={lng} width={60} height={60} notext />

        <h2 className="text-2xl text-center font-bold leading-9 tracking-tight text-gray-900">
          {t("heading")}
        </h2>
      </div>

      <div>
        <ForgotPasswordForm lng={lng} />

        <p className="mt-10 text-center text-sm text-gray-500">
          <Trans
            i18nKey={"login"}
            t={t}
            components={{
              login: (
                <Link
                  href="/login"
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
