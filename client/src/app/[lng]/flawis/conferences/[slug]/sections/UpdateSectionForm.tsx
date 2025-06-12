"use client";

import { SectionFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";
import { object, string } from "yup";
import Button from "@/components/Button";
import { updateSection } from "./actions";
import { LocalizedTextarea } from "@/components/Textarea";
import Spinner from "@/components/Spinner";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";

export default function UpdateSectionForm({
  section,
  lng,
  dialogId,
}: {
  lng: string;
  section: SectionFragment;
  dialogId: string;
}) {
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
      conference: section.conference?.id,
      translations: section.translations,
    },
  });

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6 min-w-80"
        onSubmit={methods.handleSubmit(async (data) => {
          const state = await updateSection(data, section?.id);

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
          {methods.formState.isSubmitting ? (
            <Spinner inverted />
          ) : (
            "Aktualizovat sekciu"
          )}
        </Button>
      </form>
    </FormProvider>
  );
}
