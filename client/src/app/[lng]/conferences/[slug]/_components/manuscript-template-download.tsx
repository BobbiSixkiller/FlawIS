import { localizedText } from "@/lib/i18n/text";

export function ManuscriptTemplateDownload({
  conference,
  lng,
}: {
  conference: { id: string; manuscriptTemplateFile?: string | null };
  lng: string;
}) {
  if (!conference.manuscriptTemplateFile) return null;
  const t = localizedText(lng);
  return (
    <div className="rounded-xl border bg-muted/40 p-4 text-sm text-foreground">
      <a
        className="font-medium underline underline-offset-4"
        href={`/api/conference-review/templates/${conference.id}/manuscript`}
      >
        {t(
          "Stiahnuť šablónu príspevku (DOCX)",
          "Download manuscript template (DOCX)",
        )}
      </a>
      <p className="mt-2 text-muted-foreground">
        {t(
          "Pripravte príspevok podľa šablóny a nahrajte dokončený súbor.",
          "Prepare your manuscript using the template and upload the completed file.",
        )}
      </p>
    </div>
  );
}
