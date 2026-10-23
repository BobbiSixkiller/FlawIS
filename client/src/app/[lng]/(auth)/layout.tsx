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
    <div className="flex h-screen dark:bg-background">
      <aside
        aria-label={t("facultyName")}
        className="hidden md:block relative w-5/12"
      >
        <Link href="/">
          <Logo lng={lng} inverted className="absolute top-8 left-8 z-10" />
        </Link>

        <Image
          priority
          alt=""
          src={"/images/UK-bg-3.jpg"}
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </aside>

      <ScrollWrapper
        id="auth-scroll"
        className="px-6 py-12 flex-1 flex flex-col items-center relative"
      >
        <header className="absolute top-8 right-6 flex items-center gap-2">
          <ThemeToggler lng={lng} />
          <LngSwitcher authLayout />
        </header>

        <main className="w-full max-w-96 my-auto">
          <div className="md:hidden flex justify-center mb-6">
            <Link href="/">
              <Logo lng={lng} width={60} height={60} notext />
            </Link>
          </div>

          {children}

          <footer className="mt-20">
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
      </ScrollWrapper>
    </div>
  );
}
