import Link from "next/link";
import ForgotPasswordForm from "./forgot-password-form";
import { FormMessage } from "@/components/message";
import { Trans } from "react-i18next/TransWithoutContext";
import { translate } from "@/lib/i18n";
import { cn } from "@/lib/utilsClient";

export default async function ForgotPassword({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const { t } = await translate(lng, "forgotPassword");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl text-center font-bold leading-9 tracking-tight text-foreground dark:text-foreground">
        {t("heading")}
      </h1>

      <FormMessage />

      <ForgotPasswordForm />

      <p className="mt-10 text-center text-sm text-muted-foreground dark:text-muted-foreground">
        <Trans
          i18nKey={"login"}
          t={t}
          components={{
            login: (
              <Link
                key={"login"}
                href="/login"
                className={cn([
                  "text-sm font-semibold text-primary hover:text-primary/90 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "dark:text-primary dark:hover:text-primary/90 dark:focus:ring-offset-background dark:focus:ring-ring",
                ])}
              />
            ),
          }}
        />
      </p>
    </div>
  );
}
