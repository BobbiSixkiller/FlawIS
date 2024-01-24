import Logo from "@/components/Logo";
import ResetPasswordForm from "./ResetPasswordForm";
import { useTranslation } from "@/lib/i18n";
import { Trans } from "react-i18next/TransWithoutContext";
import { Message } from "@/components/Message";

export default async function ResetPassword({
  params: { lng },
  searchParams: { token },
}: {
  params: { lng: string };
  searchParams: { token: string };
}) {
  const { t } = await useTranslation(lng, "resetPassword");

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-sm flex min-h-full flex-1 gap-4 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="flex flex-col gap-10">
        <Logo lng={lng} width={60} height={60} notext />

        <h2 className="text-2xl text-center font-bold leading-9 tracking-tight text-gray-900">
          {t("heading")}
        </h2>
      </div>

      <Message lng={lng} />

      <div>
        <ResetPasswordForm lng={lng} token={token} />
        <p className="mt-10 text-center text-sm text-gray-500">
          <Trans
            i18nKey={"link"}
            t={t}
            components={{
              forgotLink: (
                <a
                  href="/forgotPassword"
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
