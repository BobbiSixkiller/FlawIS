import { translate } from "@/lib/i18n";
export default async function Footer({ lng }: { lng: string }) {
  const { t, i18n } = await translate(lng, "dashboard");
  return (
    <footer className="mt-auto border-t px-4 py-5 text-xs text-muted-foreground sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <span className="font-medium">FlawIS · {t("facultyName")}</span>
        <ul className="flex items-center gap-4">
          <li>
            <a
              className="rounded-sm hover:text-foreground hover:underline"
              href="mailto:matus.muransky@flaw.uniba.sk"
            >
              {t("contact")}
            </a>
          </li>
          <li>
            <a
              className="rounded-sm hover:text-foreground hover:underline"
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
      </div>
    </footer>
  );
}
