import ResetPasswordForm from "./ResetPasswordForm";
import { FormMessage } from "@/components/Message";
import { translate } from "@/lib/i18n";
import { cn } from "@/utils/helpers";
import Link from "next/link";
import { Trans } from "react-i18next/TransWithoutContext";

export default async function ResetPassword({
  params,
  searchParams,
}: {
  params: Promise<{ lng: string }>;
  searchParams: Promise<{ token: string }>;
}) {
  const { lng } = await params;
  const { token } = await searchParams;
  const { t } = await translate(lng, "resetPassword");

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl text-center font-bold leading-9 tracking-tight text-gray-900 dark:text-white/85">
        {t("heading")}
      </h2>

      <FormMessage />

      <div>
        <ResetPasswordForm lng={lng} token={token} />
        <p className="mt-10 text-center text-sm text-gray-500">
          <Trans
            i18nKey={"link"}
            t={t}
            components={{
              forgotLink: (
                <Link
                  key="forgot"
                  href="/forgotPassword"
                  className={cn([
                    "text-sm font-semibold text-primary-500 hover:text-primary-500/90 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                    "dark:text-primary-300 dark:hover:text-primary-300/90 dark:focus:ring-offset-gray-900",
                  ])}
                />
              ),
            }}
          />
        </p>
      </div>
    </div>
  );
}
