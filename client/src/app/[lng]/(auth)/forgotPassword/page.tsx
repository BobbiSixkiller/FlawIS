import Link from "next/link";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { FormMessage } from "@/components/Message";
import { Trans } from "react-i18next/TransWithoutContext";
import { translate } from "@/lib/i18n";

export default async function ForgotPassword({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const { t } = await translate(lng, "forgotPassword");

  return (
    <div className="mt-6 flex flex-col gap-4">
      <h2 className="text-2xl text-center font-bold leading-9 tracking-tight text-gray-900">
        {t("heading")}
      </h2>

      <FormMessage />

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
