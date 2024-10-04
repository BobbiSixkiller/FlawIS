import ResetPasswordForm from "./ResetPasswordForm";
import { useTranslation } from "@/lib/i18n";
import { FormMessage } from "@/components/Message";
import { Trans } from "react-i18next/TransWithoutContext";

export default async function ResetPassword({
  params: { lng },
  searchParams: { token },
}: {
  params: { lng: string };
  searchParams: { token: string };
}) {
  const { t } = await useTranslation(lng, "resetPassword");

  return (
    <div className="mt-6 flex flex-col gap-4">
      <h2 className="text-2xl text-center font-bold leading-9 tracking-tight text-gray-900">
        {t("heading")}
      </h2>

      <FormMessage lng={lng} />

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
