import DynamicImage from "@/components/DynamicImage";
import Logo from "@/components/Logo";
import { translate } from "@/lib/i18n";
import { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";

export async function generateMetadata(
  {
    params: { lng },
  }: {
    params: { lng: string };
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { t } = await translate(lng, "dashboard");
  const host = headers().get("host") || "flawis.flaw.uniba.sk";
  const tenant = host.split(".")[0].replace("-staging", "");

  return {
    metadataBase:
      process.env.NODE_ENV !== "development"
        ? new URL(`https://${host}`)
        : undefined,
    title: `${t("login")} | ${t("title")}`,
    description: t(`${tenant}Desc`),
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
    <div className="flex h-screen">
      <div className="hidden md:block relative w-5/12">
        <Logo lng={lng} inverted className="absolute top-8 left-8 z-10" />
        <Image
          alt="bg-image"
          src={"/images/UK-bg-3.jpg"}
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="px-6 py-12 flex-1 flex flex-col items-center overflow-auto">
        <div className="w-full max-w-96 my-auto">
          <div className="md:hidden flex justify-center mb-6">
            <Logo lng={lng} width={60} height={60} notext />
          </div>

          {children}

          <footer className="mt-20">
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
      </div>
    </div>
  );
}
