"use client";

import { useParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { object, string } from "yup";
import { useTranslation } from "@/lib/i18n/client";
import Button from "@/components/Button";
import { yupResolver } from "@hookform/resolvers/yup";
import { createSection } from "./actions";
import { LocalizedTextarea } from "@/components/Textarea";
import Spinner from "@/components/Spinner";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";

export default function NewSectionForm({
  conferenceId,
  lng,
  dialogId,
}: {
  lng: string;
  conferenceId: string;
  dialogId: string;
}) {
  const { slug } = useParams<{ slug: string }>();

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
      translations: {
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
          const state = await createSection(data, slug);

          setMessage(state.message, state.success);

          if (state.success) {
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
