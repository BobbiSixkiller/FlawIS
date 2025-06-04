"use client";

import { FormProvider, useForm } from "react-hook-form";
import { useContext } from "react";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { boolean, number, object, string } from "yup";
import { useTranslation } from "@/lib/i18n/client";
import Button from "@/components/Button";
import { yupResolver } from "@hookform/resolvers/yup";
import { ConferenceFragment } from "@/lib/graphql/generated/graphql";
import { createTicket } from "./actions";
import { Input, LocalizedInput } from "@/components/Input";
import { LocalizedTextarea } from "@/components/Textarea";
import CheckBox from "@/components/Checkbox";
import Spinner from "@/components/Spinner";
import { useDialogStore } from "@/stores/dialogStore";

export default function NewTicketForm({
  conference,
  lng,
  dialogId,
}: {
  lng: string;
  conference?: ConferenceFragment;
  dialogId: string;
}) {
  const { dispatch } = useContext(MessageContext);

  const { t } = useTranslation(lng, "validation");

  const methods = useForm({
    resolver: yupResolver(
      object({
        online: boolean().required(),
        withSubmission: boolean().required(),
        price: number()
          .min(100, t("min", { value: 100 }))
          .required(),
        translations: object({
          sk: object({
            name: string().trim().required(t("required")),
            description: string().trim().required(t("required")),
          }),
          en: object({
            name: string().trim().required(t("required")),
            description: string().trim().required(t("required")),
          }),
        }),
      }).required(t("required"))
    ),
    values: {
      online: false,
      withSubmission: false,
      price: 0,
      translations: {
        sk: { name: "", description: "" },
        en: { name: "", description: "" },
      },
    },
  });

  const { closeDialog } = useDialogStore();

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6 w-full sm:w-96"
        onSubmit={methods.handleSubmit(async (data) => {
          const state = await createTicket(data, conference!.slug);

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
        <LocalizedInput
          lng={lng}
          label="Nazov listku"
          name={`translations.${lng}.name`}
        />
        <LocalizedTextarea
          lng={lng}
          label="Popis listku"
          name={`translations.${lng}.description`}
        />
        <Input label="Cena s DPH v centoch" name="price" type="number" />
        <CheckBox label="Online" name="online" />
        <CheckBox label="S prispevkom" name="withSubmission" />

        <Button
          color="primary"
          type="submit"
          className="w-full"
          disabled={methods.formState.isSubmitting}
        >
          {methods.formState.isSubmitting ? (
            <Spinner inverted />
          ) : (
            "Vytvorit formu ucasti"
          )}
        </Button>
      </form>
    </FormProvider>
  );
}
