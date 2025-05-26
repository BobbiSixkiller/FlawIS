import { cookies } from "next/headers";
import Logo from "./Logo";
import { translate } from "@/lib/i18n";

export default async function Footer({ lng }: { lng: string }) {
  const { t, i18n } = await translate(lng, "dashboard");
  const theme = cookies().get("theme")?.value || "";

  return (
    <div className="mt-auto bg-black md:bg-transparent">
      <div className="mx-auto p-6">
        <Logo lng={lng} height={60} width={60} inverted className="md:hidden" />

        <div className="flex flex-col gap-4">
          <Logo
            lng={lng}
            width={36}
            height={36}
            notext
            className="hidden md:block"
          />

          <ul className="pt-4 md:pt-0 text-xs dark:text-white/75 text-gray-300 md:text-gray-500 flex md:flex-col gap-2 md:gap-1">
            <li className="hover:underline hover:text-white md:hover:text-primary-500 dark:hover:text-primary-300 cursor-pointer">
              <a
                className="focus:outline-transparent"
                href="mailto:matus.muransky@flaw.uniba.sk"
              >
                {t("contact")}
              </a>
            </li>
            <li className="hover:underline hover:text-white md:hover:text-primary-500 dark:hover:text-primary-300  cursor-pointer">
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
