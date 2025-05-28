import Link from "next/link";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { FormMessage } from "@/components/Message";
import { Trans } from "react-i18next/TransWithoutContext";
import { translate } from "@/lib/i18n";
import { cn } from "@/utils/helpers";

export default async function ForgotPassword({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const { t } = await translate(lng, "forgotPassword");

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl text-center font-bold leading-9 tracking-tight text-gray-900 dark:text-white/85">
        {t("heading")}
      </h2>

      <FormMessage />

      <ForgotPasswordForm />

      <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-300">
        <Trans
          i18nKey={"login"}
          t={t}
          components={{
            login: (
              <Link
                href="/login"
                className={cn([
                  "text-sm font-semibold text-primary-500 hover:text-primary-500/90 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                  "dark:text-primary-300 dark:hover:text-primary-300/90 dark:focus:ring-offset-gray-950 dark:focus:ring-primary-300",
                ])}
              />
            ),
          }}
        />
      </p>
    </div>
  );
}
