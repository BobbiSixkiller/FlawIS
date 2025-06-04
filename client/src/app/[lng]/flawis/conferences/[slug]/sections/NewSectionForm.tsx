"use client";

import { useParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { useContext } from "react";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { object, string } from "yup";
import { useTranslation } from "@/lib/i18n/client";
import Button from "@/components/Button";
import { yupResolver } from "@hookform/resolvers/yup";
import { createSection } from "./actions";
import { LocalizedTextarea } from "@/components/Textarea";
import Spinner from "@/components/Spinner";
import { useDialogStore } from "@/stores/dialogStore";
import { FormMessage } from "@/components/Message";

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

  const { dispatch } = useContext(MessageContext);

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

  const { closeDialog } = useDialogStore();

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6 min-w-80"
        onSubmit={methods.handleSubmit(async (data) => {
          const state = await createSection(data, slug);

          if (state.message && !state.success) {
            dispatch({
              type: ActionTypes.SetFormMsg,
              payload: state,
            });
          }

          if (state.success) {
            dispatch({
              type: ActionTypes.SetAppMsg,
              payload: state,
            });
            closeDialog(dialogId);
          }
        })}
      >
        <FormMessage />

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
