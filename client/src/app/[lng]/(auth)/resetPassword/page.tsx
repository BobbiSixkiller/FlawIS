import ResetPasswordForm from "./reset-password-form";
import { FormMessage } from "@/components/message";
import { translate } from "@/lib/i18n";
import { cn } from "@/lib/utilsClient";
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
      <h1 className="text-2xl text-center font-bold leading-9 tracking-tight text-foreground dark:text-foreground">
        {t("heading")}
      </h1>

      <FormMessage />

      <div>
        <ResetPasswordForm lng={lng} token={token} />
        <p className="mt-10 text-center text-sm text-muted-foreground">
          <Trans
            i18nKey={"link"}
            t={t}
            components={{
              forgotLink: (
                <Link
                  key="forgot"
                  href="/forgotPassword"
                  className={cn([
                    "text-sm font-semibold text-primary hover:text-primary/90 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    "dark:text-primary dark:hover:text-primary/90 dark:focus:ring-offset-background",
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
