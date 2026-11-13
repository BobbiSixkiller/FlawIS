"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useMounted from "@/hooks/use-mounted";
import { ConferenceTemplateKind } from "@/lib/graphql/generated/graphql";
import { localizedText } from "@/lib/i18n/text";
import { uploadReviewFile } from "@/lib/reviews/files";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/form/form-dialog";
import TemplateEditor from "./template-editor";
import { setConferenceTemplate } from "../actions";

export default function ConferenceTemplates({
  conference,
  manuscript,
  review,
  lng,
}: {
  conference: string;
  manuscript?: string | null;
  review?: string | null;
  lng: string;
}) {
  const t = localizedText(lng);
  const router = useRouter();
  const mounted = useMounted();
  const [editing, setEditing] = useState<ConferenceTemplateKind | null>(null);
  const [removing, setRemoving] = useState<ConferenceTemplateKind | null>(null);
  const templates = {
    [ConferenceTemplateKind.Manuscript]: {
      title: t("Šablóna príspevku", "Manuscript template"),
      description: t(
        "Autori si stiahnu šablónu, pripravia v nej príspevok a nahrajú dokončený súbor. Dostupná je aj pri vypnutom recenzovaní.",
        "Authors download this template, write their manuscript in it and upload the completed file. It is available even when reviews are disabled.",
      ),
      file: manuscript,
      href: `/api/conference-review/templates/${conference}/manuscript`,
      empty: t("Šablóna zatiaľ nie je nahraná.", "No template uploaded yet."),
    },
    [ConferenceTemplateKind.Review]: {
      title: t("Šablóna recenzného posudku", "Review report template"),
      description: t(
        "Aplikácia vyplní oficiálny DOCX posudok z odpovedí recenzenta, odporúčania a údajov o príspevku. Nová šablóna sa použije pre nové kolá; existujúce kolá si ponechajú pôvodnú.",
        "The app generates the official DOCX report from the reviewer’s answers, recommendation and submission details. A new template applies to new rounds; existing rounds keep their original template.",
      ),
      file: review,
      href: `/api/conference-review/files/${review}`,
      empty: t(
        "Používa sa základná šablóna aplikácie.",
        "Using the app’s default report template.",
      ),
    },
  };
  const save = async (kind: ConferenceTemplateKind, file: string | null) => {
    const result = await setConferenceTemplate({ conference, kind, file });
    if (!result.ok) throw new Error(templateError(result.message, lng));
    router.refresh();
  };
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold">{t("Šablóny", "Templates")}</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        {Object.values(ConferenceTemplateKind).map((kind) => {
          const template = templates[kind];
          return (
            <Card key={kind}>
              <CardHeader>
                <CardTitle>{template.title}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {template.file ? (
                  <a
                    className="w-fit underline underline-offset-4"
                    href={template.href}
                  >
                    {t(
                      "Stiahnuť aktuálnu šablónu",
                      "Download current template",
                    )}
                  </a>
                ) : (
                  <p className="text-muted-foreground">{template.empty}</p>
                )}
                {kind === ConferenceTemplateKind.Review && (
                  <details className="text-sm">
                    <summary className="cursor-pointer">
                      {t(
                        "Ako pripraviť šablónu posudku",
                        "Prepare a review report template",
                      )}
                    </summary>
                    <p className="mt-2">
                      {t(
                        "Do Word dokumentu vložte značky na miesta, ktoré má aplikácia vyplniť. Zachová sa rozloženie aj formátovanie dokumentu.",
                        "Insert placeholders in the Word document where the app should fill in values. The document’s layout and formatting are preserved.",
                      )}
                    </p>
                    <p className="mt-2 break-words font-mono">
                      {
                        "{paper}, {reviewer}, {recommendation}, {answers}, {date}, {publish}, {conditional}, {reject}"
                      }
                    </p>
                    <p className="mt-2">
                      {t(
                        "Značku konkrétnej otázky nájdete v knižnici formulárov. Recenzent vypĺňa online formulár, nie túto šablónu.",
                        "Find each question’s placeholder in the form library. The reviewer completes the online form, not this template.",
                      )}
                    </p>
                  </details>
                )}
              </CardContent>
              <CardFooter className="mt-auto flex-wrap gap-2">
                <Button
                  variant="outline"
                disabled={!mounted}
                  aria-label={`${t("Nahrať", "Upload")} · ${template.title}`}
                  onClick={() => setEditing(kind)}
                >
                  {template.file
                    ? t("Nahradiť šablónu", "Replace template")
                    : t("Nahrať šablónu", "Upload template")}
                </Button>
                {template.file && (
                  <Button
                    variant="ghost"
                  disabled={!mounted}
                    aria-label={`${t("Odstrániť", "Remove")} · ${template.title}`}
                    onClick={() => setRemoving(kind)}
                  >
                    {kind === ConferenceTemplateKind.Review
                      ? t("Použiť základnú šablónu", "Use default template")
                      : t("Odstrániť", "Remove")}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
      {editing && (
        <TemplateEditor
          lng={lng}
          title={templates[editing].title}
          description={templates[editing].description}
          onClose={() => setEditing(null)}
          onUpload={async (file, onProgress) => {
            try {
              return await uploadReviewFile(file, {
                conference,
                kind:
                  editing === ConferenceTemplateKind.Manuscript
                    ? "MANUSCRIPT_TEMPLATE"
                    : "TEMPLATE",
                onProgress,
              });
            } catch (error) {
              throw new Error(
                templateError(error instanceof Error ? error.message : "", lng),
              );
            }
          }}
          onSave={(id) => save(editing, id)}
        />
      )}
      {removing && (
        <ConfirmDialog
          lng={lng}
          title={templates[removing].title}
          description={
            removing === ConferenceTemplateKind.Manuscript
              ? t(
                  "Autori už nebudú mať k dispozícii šablónu na stiahnutie. Odovzdané príspevky zostanú zachované.",
                  "Authors will no longer have a template to download. Submitted manuscripts are preserved.",
                )
              : t(
                  "Nové kolá použijú základnú šablónu. Existujúce kolá a posudky zostanú zachované.",
                  "New rounds will use the default template. Existing rounds and reports are preserved.",
                )
          }
          onClose={() => setRemoving(null)}
          onConfirm={() => save(removing, null)}
        />
      )}
    </div>
  );
}

function templateError(message: string, lng: string) {
  const t = localizedText(lng);
  if (/DOCX|Multi error|zip|macro/i.test(message))
    return t(
      "Skontrolujte DOCX súbor a jeho značky. Dokument nesmie obsahovať makrá ani vložené programy.",
      "Check the DOCX file and its placeholders. Documents must not contain macros or embedded programs.",
    );
  if (/20 MiB|1 byte/i.test(message))
    return t(
      "Vyberte neprázdny súbor s veľkosťou najviac 20 MiB.",
      "Choose a non-empty file up to 20 MiB.",
    );
  if (/coordinate|access|Authentication/i.test(message))
    return t(
      "Šablóny môže meniť administrátor alebo koordinátor celej konferencie.",
      "Only administrators and conference-wide coordinators can change templates.",
    );
  return t(
    "Šablónu sa nepodarilo uložiť. Skúste to znova.",
    "Could not save the template. Try again.",
  );
}
