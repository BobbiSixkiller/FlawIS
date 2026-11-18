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
  lng,
}: {
  conference: string;
  manuscript?: string | null;
  lng: string;
}) {
  const t = localizedText(lng);
  const router = useRouter();
  const mounted = useMounted();
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState(false);
  const title = t("Šablóna príspevku", "Manuscript template");
  const description = t(
    "Autori si stiahnu túto šablónu. Pri odovzdaní dokumentu DOCX aplikácia skontroluje rozmery strany a okraje každej sekcie.",
    "Authors download this template. When they submit a DOCX, the app checks the page size and margins of every section.",
  );

  async function save(file: string | null) {
    const result = await setConferenceTemplate({
      conference,
      kind: ConferenceTemplateKind.Manuscript,
      file,
    });
    if (!result.ok) throw new Error(templateError(result.message, lng));
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold">{t("Šablóny", "Templates")}</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {manuscript ? (
            <a
              className="underline underline-offset-4"
              href={
                "/api/conference-review/templates/" + conference + "/manuscript"
              }
            >
              {t("Stiahnuť aktuálnu šablónu", "Download current template")}
            </a>
          ) : (
            <p>
              {t("Šablóna zatiaľ nie je nahraná.", "No template uploaded yet.")}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex-wrap gap-2">
          <Button disabled={!mounted} onClick={() => setEditing(true)}>
            {manuscript
              ? t("Nahradiť", "Replace")
              : t("Nahrať šablónu", "Upload template")}
          </Button>
          {manuscript && (
            <Button
              variant="outline"
              disabled={!mounted}
              onClick={() => setRemoving(true)}
            >
              {t("Odstrániť", "Remove")}
            </Button>
          )}
        </CardFooter>
      </Card>
      {editing && (
        <TemplateEditor
          lng={lng}
          title={title}
          description={description}
          onClose={() => setEditing(false)}
          onSave={save}
          onUpload={async (file, onProgress) => {
            try {
              return await uploadReviewFile(file, {
                conference,
                kind: "MANUSCRIPT_TEMPLATE",
                onProgress,
              });
            } catch (e) {
              throw new Error(
                templateError(e instanceof Error ? e.message : "", lng),
              );
            }
          }}
        />
      )}
      {removing && (
        <ConfirmDialog
          lng={lng}
          title={title}
          description={t(
            "Odstrániť túto šablónu pre nové príspevky?",
            "Remove this template for new submissions?",
          )}
          onClose={() => setRemoving(false)}
          onConfirm={() => save(null)}
        />
      )}
    </div>
  );
}

function templateError(message: string, lng: string) {
  const t = localizedText(lng);
  if (/DOCX|Multi error|zip|macro/i.test(message))
    return t(
      "Skontrolujte formát a nastavenie strán súboru DOCX. Dokument nesmie obsahovať makrá ani vložené programy.",
      "Check the DOCX file and its page layout. Documents must not contain macros or embedded programs.",
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
