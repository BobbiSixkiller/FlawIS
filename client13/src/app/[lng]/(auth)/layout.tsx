import Logo from "@/components/Logo";
import { useTranslation } from "@/lib/i18n";

export default async function AuthLayout({
  children,
  params: { lng },
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  const { i18n, t } = await useTranslation(lng, "landing");

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-sm flex flex-col justify-center px-6 py-12 lg:px-8">
      <Logo lng={lng} width={60} height={60} notext />

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
