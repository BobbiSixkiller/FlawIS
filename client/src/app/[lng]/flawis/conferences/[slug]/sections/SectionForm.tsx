"use client";

import { useParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { object, string } from "yup";
import { useTranslation } from "@/lib/i18n/client";
import Button from "@/components/Button";
import { yupResolver } from "@hookform/resolvers/yup";
import { createSection, updateSection } from "./actions";
import { LocalizedTextarea } from "@/components/Textarea";
import Spinner from "@/components/Spinner";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import { SectionFragment } from "@/lib/graphql/generated/graphql";

export default function SectionForm({
  conferenceId,
  dialogId,
  section,
}: {
  dialogId: string;
  conferenceId: string;
  section?: SectionFragment;
}) {
  const { slug, lng } = useParams<{ slug: string; lng: string }>();

  const { t } = useTranslation(lng, "validation");

  const methods = useForm({
    resolver: yupResolver(
      object({
        conference: string().required(),
        translations: object({
          sk: object({
            name: string().trim().required(t("required")),
            topic: string().trim().required(t("required")),
          }),
          en: object({
            name: string().trim().required(t("required")),
            topic: string().trim().required(t("required")),
          }),
        }),
      }).required(t("required"))
    ),
    values: {
      conference: conferenceId,
      translations: section?.translations || {
        sk: { name: "", topic: "" },
        en: { name: "", topic: "" },
      },
    },
  });

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6 min-w-80"
        onSubmit={methods.handleSubmit(async (data) => {
          let res;
          if (section) {
            res = await updateSection({ id: section.id, data });
          } else {
            res = await createSection({ data });
          }

          setMessage(res.message, res.success);

          if (res.success) {
            closeDialog(dialogId);
          }
        })}
      >
        <LocalizedTextarea
          lng={lng}
          label="Nazov sekcie"
          name={`translations.${lng}.name`}
        />
        <LocalizedTextarea
          lng={lng}
          label="Tema sekcie"
          name={`translations.${lng}.topic`}
        />

        <Button
          color="primary"
          type="submit"
          className="w-full"
          disabled={methods.formState.isSubmitting}
        >
          {methods.formState.isSubmitting ? <Spinner inverted /> : "Vytvorit"}
        </Button>
      </form>
    </FormProvider>
  );
}
