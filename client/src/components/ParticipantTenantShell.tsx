import {
  ArrowLeftStartOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  ChevronRightIcon,
  HomeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { cookies } from "next/headers";
import { ReactNode } from "react";

import ActivateAccountDialog from "@/app/[lng]/(auth)/ActivateAccountDialog";
import Avatar from "@/components/Avatar";
import Breadcrumbs from "@/components/Breadcrumbs";
import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";
import LngSwitcher from "@/components/LngSwitcher";
import Logo from "@/components/Logo";
import { Snackbar } from "@/components/Message";
import SessionPolling from "@/components/SessionPolling";
import ThemeToggler from "@/components/ThemeToggler";
import { UserFragment } from "@/lib/graphql/generated/graphql";
import { translate } from "@/lib/i18n";
import { cn } from "@/lib/clientUtils";

export default async function ParticipantTenantShell({
  children,
  lng,
  modal,
  sessionPolling = false,
  user,
}: {
  children: ReactNode;
  lng: string;
  modal: ReactNode;
  sessionPolling?: boolean;
  user?: UserFragment | null;
}) {
  const [cookieStore, translation] = await Promise.all([
    cookies(),
    translate(lng, "dashboard"),
  ]);
  const theme = cookieStore.get("theme")?.value || "";
  const { t, i18n } = translation;

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center",
        "dark:bg-gray-950 dark:text-white/85",
      )}
    >
      <header className="flex h-[60px] w-full items-center justify-end gap-2 p-6 sm:max-w-md sm:p-2">
        <ThemeToggler authLayout dark={theme === "dark"} />
        {user ? (
          <Dropdown
            anchor={{ gap: 6, to: "bottom" }}
            trigger={<Avatar name={user.name} avatarUrl={user.avatarUrl} />}
            triggerProps={{
              size: "icon",
              className: "flex h-fit w-fit items-center rounded-full",
            }}
            items={[
              <Link href="/profile" prefetch={false} key="profile">
                <UserCircleIcon className="size-5" aria-hidden="true" />
                {t("profile")}
              </Link>,
              <Link href="/logout" prefetch={false} key="logout">
                <ArrowLeftStartOnRectangleIcon
                  className="size-5"
                  aria-hidden="true"
                />
                {t("logout")}
              </Link>,
            ]}
          />
        ) : (
          <Button
            as={Link}
            href="/login"
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <ArrowRightStartOnRectangleIcon className="size-5" />
          </Button>
        )}
        <LngSwitcher authLayout />
      </header>

      <main className="flex w-full flex-1 flex-col gap-6 p-6 py-12 sm:max-w-md sm:px-0">
        <Breadcrumbs
          homeElement={<HomeIcon className="h-5 w-5" />}
          separator={<ChevronRightIcon className="h-3 w-3" />}
          activeClasses="text-primary-500 dark:text-primary-300 hover:underline"
          containerClasses="flex justify-center flex-wrap text-sm gap-2 items-center dark:text-white/85"
          listClasses="outline-hidden focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-300"
          capitalizeLinks
        />
        {children}
      </main>

      <footer
        className={cn(
          "w-full max-w-lg border-t p-12",
          "dark:border-gray-700",
        )}
      >
        <Logo
          lng={lng}
          height={60}
          width={60}
          inverted={theme === "dark"}
          className="justify-center"
        />

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
