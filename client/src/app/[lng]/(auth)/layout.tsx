import Logo from "@/components/Logo";
import { translate } from "@/lib/i18n";
import { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  {
    params: { lng },
  }: {
    params: { lng: string };
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { t } = await translate(lng, "dashboard");

  return {
    title: `${t("login")} | ${t("title")}`,
    openGraph: {
      images: [`/images/Praf-logo-text-${lng}.png`],
    },
  };
}

export default async function AuthLayout({
  children,
  params: { lng },
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  const { i18n, t } = await translate(lng, "dashboard");

  return (
    <div className="mx-auto w-full max-w-96 flex flex-col justify-center px-6 py-12">
      <div className="mx-auto">
        <Logo lng={lng} width={60} height={60} notext />
      </div>

      {children}

      <footer className="pt-20">
        <ul className="text-xs text-gray-500 flex gap-4 justify-center">
          <li className="hover:underline hover:text-primary-500 cursor-pointer">
            <a
              href="mailto:matus.muransky@flaw.uniba.sk"
              className="focus:outline-primary-500"
            >
              {t("contact")}
            </a>
          </li>
          <li className="hover:underline hover:text-primary-500 cursor-pointer">
            <a
              className="focus:outline-primary-500"
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
    </div>
  );
}
