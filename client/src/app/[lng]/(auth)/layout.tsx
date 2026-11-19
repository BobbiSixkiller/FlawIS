import LngSwitcher from "@/components/lng-switcher";
import Logo from "@/components/logo";
import ScrollWrapper from "@/components/scroll-wrapper";
import ThemeToggler from "@/components/theme-toggler";
import { translate } from "@/lib/i18n";
import { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata(
  {
    params,
  }: {
    params: Promise<{ lng: string }>;
  },
  parent: ResolvingMetadata,
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
  const title = `${t(tenant)} | ${t("title")}`;
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

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const { i18n, t } = await translate(lng, "dashboard");

  return (
    <ScrollWrapper id="auth-scroll" className="h-dvh bg-background">
      <div className="relative flex min-h-full flex-col md:flex-row">
        <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 px-4 pt-4 md:px-8 md:pt-8">
          <div className="@container flex min-w-0 flex-1">
            <Link
              href="/"
              aria-label={t("facultyName")}
              className="inline-flex rounded-sm focus-visible:outline-white"
            >
              <Logo
                lng={lng}
                inverted
                className="items-center gap-2 whitespace-nowrap [&>img]:size-11 md:gap-4 md:[&>img]:size-14 [&>div]:hidden @min-[12rem]:[&>div]:flex"
              />
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-full bg-background p-1 md:bg-transparent md:p-0">
            <ThemeToggler lng={lng} />
            <LngSwitcher />
          </div>
        </header>

        <div
          aria-hidden="true"
          className="relative h-[clamp(10rem,24svh,12.5rem)] shrink-0 overflow-hidden md:sticky md:top-0 md:h-dvh md:w-5/12 md:self-start"
        >
          <Image
            priority
            alt=""
            src={"/images/UK-bg-3.jpg"}
            fill
            className="object-cover object-[center_45%] md:object-center"
            sizes="(max-width: 767px) 100vw, 42vw"
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/55 to-transparent md:hidden" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-center px-6 pt-6 pb-8 md:py-24">
          <main className="w-full max-w-96 md:my-auto">
            {children}

            <footer className="mt-8 md:mt-20">
              <ul className="text-xs text-muted-foreground dark:text-foreground flex gap-4 justify-center">
                <li className="hover:underline hover:text-primary dark:hover:text-primary cursor-pointer">
                  <a
                    href="mailto:matus.muransky@flaw.uniba.sk"
                    className="focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:focus:ring-offset-background dark:focus:ring-ring"
                  >
                    {t("contact")}
                  </a>
                </li>
                <li className="hover:underline hover:text-primary dark:hover:text-primary cursor-pointer">
                  <a
                    className="focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:focus:ring-offset-background dark:focus:ring-ring"
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
            </footer>
          </main>
        </div>
      </div>
    </ScrollWrapper>
  );
}
