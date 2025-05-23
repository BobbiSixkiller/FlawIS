import Logo from "./Logo";
import { translate } from "@/lib/i18n";

export default async function Footer({ lng }: { lng: string }) {
  const { t, i18n } = await translate(lng, "dashboard");

  return (
    <div className="bg-gray-900 md:bg-white mt-auto">
      <div className="mx-auto p-6">
        <Logo lng={lng} height={60} width={60} inverted className="md:hidden" />

        <div className="flex flex-col gap-4">
          <Logo lng={lng} width={36} height={36} notext />

          <span className="md:hidden text-xs text-gray-500">{`© ${new Date().getFullYear()} ${t(
            "title"
          )}`}</span>

          <ul className="pt-4 md:pt-0 text-xs text-gray-300 md:text-gray-500 flex md:flex-col gap-1">
            <li className="hover:underline hover:text-white md:hover:text-primary-500 cursor-pointer">
              <a
                className="focus:outline-transparent"
                href="mailto:matus.muransky@flaw.uniba.sk"
              >
                {t("contact")}
              </a>
            </li>
            <li className="hover:underline hover:text-white md:hover:text-primary-500 cursor-pointer">
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
      </div>
    </div>
  );
}
