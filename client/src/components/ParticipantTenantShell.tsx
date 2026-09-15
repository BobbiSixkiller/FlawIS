import AccountMenu from "@/components/AccountMenu";
import TopBar from "@/components/TopBar";
import { ReactNode } from "react";

import ActivateAccountDialog from "@/app/[lng]/(auth)/ActivateAccountDialog";
import Avatar from "@/components/Avatar";
import LngSwitcher from "@/components/LngSwitcher";
import Logo from "@/components/Logo";
import { Snackbar } from "@/components/Message";
import SessionPolling from "@/components/SessionPolling";
import ThemeToggler from "@/components/ThemeToggler";
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
        "dark:bg-gray-950 dark:text-white/85",
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
            <LngSwitcher authLayout />
          </>
        }
      />

      <main className="flex w-full flex-1 flex-col gap-6 p-6 py-12 sm:max-w-md sm:px-0">
        {children}
      </main>

      <footer
        className={cn("w-full max-w-lg border-t p-12", "dark:border-gray-700")}
      >
        <Logo lng={lng} height={60} width={60} className="justify-center" />

        <ul className="flex justify-center gap-2 pt-4 text-xs text-gray-500 dark:text-white/75">
          <li className="cursor-pointer hover:underline lg:hover:text-primary-500 dark:hover:text-primary-300">
            <a
              className="focus:outline-transparent"
              href="mailto:matus.muransky@flaw.uniba.sk"
            >
              {t("contact")}
            </a>
          </li>
          <li className="cursor-pointer hover:underline lg:hover:text-primary-500 dark:hover:text-primary-300">
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
