import { translate } from "@/lib/i18n";
import { Metadata, ResolvingMetadata } from "next";
import { cookies, headers } from "next/headers";
import ActivateAccountDialog from "../(auth)/ActivateAccountDialog";
import { getMe } from "../(auth)/actions";
import Logo from "@/components/Logo";
import { cn } from "@/utils/helpers";
import ThemeToggler from "@/components/ThemeToggler";
import LngSwitcher from "@/components/LngSwitcher";
import Button from "@/components/Button";
import Link from "next/link";
import {
  ArrowLeftStartOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  ChevronRightIcon,
  HomeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Dropdown from "@/components/Dropdown";
import Avatar from "@/components/Avatar";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Snackbar } from "@/components/Message";

export async function generateMetadata(
  {
    params,
  }: {
    params: Promise<{ lng: string }>;
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { lng } = await params;
  const { t } = await translate(lng, "dashboard");
  const headerStore = await headers();

  const host = headerStore.get("host") || "flawis.flaw.uniba.sk";
  const tenant = host.split(".")[0].replace("-staging", "");

  const url =
    process.env.NODE_ENV !== "development"
      ? new URL(`https://${host}`)
      : undefined;
  const title = `${t("courses")} | ${t("coursesDesc")}`;
  const description = t(`${tenant}Desc`);

  return {
    metadataBase: url,
    title,
    description,
    openGraph: {
      url,
      type: "website",
      siteName: "FlawIS",
      locale: lng,
      title,
      description,
      images: [`/images/Praf-logo-text-${lng}.png`],
    },
  };
}

export default async function CoursesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const user = await getMe();

  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || "";

  const { t, i18n } = await translate(lng, "dashboard");

  return (
    <div
      className={cn([
        "min-h-screen flex flex-col items-center",
        "dark:bg-gray-900 dark:text-white/85",
      ])}
    >
      <div className="sm:max-w-md w-full flex justify-end gap-2 items-center p-6 sm:p-2 h-[60px]">
        <ThemeToggler authLayout dark={theme === "dark"} />
        {user ? (
          <Dropdown
            anchor={{ gap: 6, to: "bottom" }}
            trigger={
              <Button
                size="icon"
                className="rounded-full flex items-center w-fit h-fit"
              >
                <Avatar name={user.name} avatarUrl={user.avatarUrl} />
              </Button>
            }
            items={[
              <Link href="/profile" prefetch={false} key={0}>
                <UserCircleIcon className="size-5" aria-hidden="true" />
                {t("profile")}
              </Link>,
              <Link href="/logout" prefetch={false} key={1}>
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
        <LngSwitcher authLayout className="flex items-center" />
      </div>
      <div className="sm:max-w-md w-full p-6 sm:px-0 flex-1 py-12 flex flex-col gap-6">
        <Breadcrumbs
          homeElement={<HomeIcon className="h-5 w-5" />}
          separator={<ChevronRightIcon className="h-3 w-3" />}
          activeClasses="text-primary-500 dark:text-primary-300 hover:underline"
          containerClasses="flex justify-center flex-wrap text-sm gap-2 items-center dark:text-white/85"
          listClasses="outline-none focus:ring-2 focus:ring-primary-500"
          capitalizeLinks
        />
        {children}
      </div>
      <div
        className={cn([
          "p-12 border-t max-w-lg w-full",
          "dark:border-gray-700",
        ])}
      >
        <Logo
          lng={lng}
          height={60}
          width={60}
          inverted={theme === "dark"}
          className="justify-center"
        />

        <ul className="pt-4 text-xs dark:text-white/75 text-gray-500 flex gap-2 justify-center">
          <li className="hover:underline hover:text-white lg:hover:text-primary-500 dark:hover:text-primary-300 cursor-pointer">
            <a
              className="focus:outline-transparent"
              href="mailto:matus.muransky@flaw.uniba.sk"
            >
              {t("contact")}
            </a>
          </li>
          <li className="hover:underline hover:text-white lg:hover:text-primary-500 dark:hover:text-primary-300  cursor-pointer">
            <a
              className="focus:outline-transparent"
              target="_blank"
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
      </div>

      <Snackbar />
      <ActivateAccountDialog lng={lng} user={user} />
    </div>
  );
}
