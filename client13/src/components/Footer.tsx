import { useTranslation } from "@/lib/i18n";

export default async function Footer({ lng }: { lng: string }) {
  const { t, i18n } = await useTranslation(lng, "footer");

  return (
    <ul className="text-xs text-gray-900 align-bottom">
      <li className="hover:underline hover:text-primary-500 cursor-pointer">
        <a href="mailto:matus.muransky@flaw.uniba.sk">{t("contact")}</a>
      </li>
      <li className="hover:underline hover:text-primary-500 cursor-pointer">
        <a
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
  );
}
