import AccountMenu from "@/components/account-menu";
import TopBar from "@/components/top-bar";
import { ReactNode } from "react";

import ActivateAccountDialog from "@/app/[lng]/(auth)/activate-account-dialog";
import Avatar from "@/components/avatar";
import LngSwitcher from "@/components/lng-switcher";
import Logo from "@/components/logo";
import { Snackbar } from "@/components/message";
import SessionPolling from "@/components/session-polling";
import ThemeToggler from "@/components/theme-toggler";
import { UserFragment } from "@/lib/graphql/generated/graphql";
import { translate } from "@/lib/i18n";
import { cn } from "@/lib/utilsClient";

export default async function ParticipantTenantShell({
  children,
  lng,
  modal,
  sessionPolling = false,
  signInHref = "/login",
  user,
}: {
  children: ReactNode;
  lng: string;
  modal: ReactNode;
  sessionPolling?: boolean;
  signInHref?: string;
  user?: UserFragment | null;
}) {
  const { t, i18n } = await translate(lng, "dashboard");

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center",
        "dark:bg-background dark:text-foreground",
      )}
    >
      <TopBar
        logo={<Logo lng={lng} notext height={40} width={40} />}
        contentClassName="max-w-xl px-6 sm:px-2"
        actions={
          <>
            <ThemeToggler lng={lng} />
            <AccountMenu
              avatar={
                user ? (
                  <Avatar name={user.name} avatarUrl={user.avatarUrl} />
                ) : undefined
              }
              signInHref={signInHref}
            />
            <LngSwitcher />
          </>
        }
      />

      <main className="flex w-full flex-1 flex-col gap-6 p-6 py-12 sm:max-w-md sm:px-0">
        {children}
      </main>

      <footer
        className={cn("w-full max-w-lg border-t p-12", "dark:border-border")}
      >
        <Logo lng={lng} height={60} width={60} className="justify-center" />

        <ul className="flex justify-center gap-2 pt-4 text-xs text-muted-foreground dark:text-muted-foreground">
          <li className="cursor-pointer hover:underline lg:hover:text-primary dark:hover:text-primary">
            <a
              className="focus:outline-transparent"
              href="mailto:matus.muransky@flaw.uniba.sk"
            >
              {t("contact")}
            </a>
          </li>
          <li className="cursor-pointer hover:underline lg:hover:text-primary dark:hover:text-primary">
            <a
              className="focus:outline-transparent"
              target="_blank"
              rel="noreferrer"
              href={
                i18n.language === "sk"
                  ? "https://uniba.sk/ochrana-osobnych-udajov/"
                  : "https://uniba.sk/en/privacy-policy/"
              }
            >
              {t("privacy")}
            </a>
          </li>
        </ul>
      </footer>

      {modal}
      <Snackbar />
      <ActivateAccountDialog lng={lng} user={user ?? undefined} />
      {sessionPolling ? <SessionPolling /> : null}
    </div>
  );
}
