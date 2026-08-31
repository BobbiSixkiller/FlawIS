import Button from "@/components/Button";
import { logoutHref } from "@/lib/authRedirect";
import { translate } from "@/lib/i18n";
import Link from "next/link";

const accountMismatchCode = "INVITATION_EMAIL_MISMATCH";

export default async function InvitationError({
  lng,
  message,
  code,
  currentEmail,
  invitationHref,
  conferenceHref,
}: {
  lng: string;
  message: string;
  code?: string;
  currentEmail?: string;
  invitationHref: string;
  conferenceHref: string;
}) {
  const { t } = await translate(lng, "conferences");
  const isAccountMismatch = code === accountMismatchCode;

  return (
    <section
      role="alert"
      className="space-y-4 rounded-lg border border-red-500 bg-red-100 p-5 text-red-800 dark:bg-red-950/40 dark:text-red-200"
    >
      <div className="space-y-2">
        <h1 className="text-xl font-bold">
          {t("registration.invitationError.heading")}
        </h1>
        <p>{message}</p>
        {isAccountMismatch && (
          <div className="space-y-1">
            {currentEmail && (
              <p>
                {t("registration.invitationError.signedInAs", {
                  email: currentEmail,
                })}
              </p>
            )}
            <p>{t("registration.invitationError.accountMismatchHelp")}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {isAccountMismatch && (
          <Button
            as={Link}
            href={logoutHref(invitationHref)}
            prefetch={false}
          >
            {t("registration.invitationError.useAnotherAccount")}
          </Button>
        )}
        <Button as={Link} href={conferenceHref} variant="secondary">
          {t("registration.invitationError.backToConference")}
        </Button>
      </div>
    </section>
  );
}
