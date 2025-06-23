"use client";

import { useParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { boolean, number, object, string } from "yup";
import { useTranslation } from "@/lib/i18n/client";
import Button from "@/components/Button";
import { yupResolver } from "@hookform/resolvers/yup";
import { TicketFragment } from "@/lib/graphql/generated/graphql";
import { createTicket, updateTicket } from "./actions";
import { Input, LocalizedInput } from "@/components/Input";
import { LocalizedTextarea } from "@/components/Textarea";
import CheckBox from "@/components/Checkbox";
import Spinner from "@/components/Spinner";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";

export default function TicketForm({
  ticket,
  lng,
  dialogId,
}: {
  lng: string;
  ticket?: TicketFragment;
  dialogId: string;
}) {
  const { slug } = useParams<{ slug: string }>();

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
      online: ticket?.online || false,
      withSubmission: ticket?.withSubmission || false,
      price: ticket?.price || 0,
      translations: ticket?.translations || {
        en: { name: "", description: "" },
        sk: { name: "", description: "" },
      },
    },
  });

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6 w-full sm:w-96"
        onSubmit={methods.handleSubmit(async (data) => {
          let res;
          if (ticket) {
            res = await updateTicket({ data, slug, ticketId: ticket.id });
          } else {
            res = await createTicket({ data, slug });
          }

          setMessage(res.message, res.success);

          if (res.success) {
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
        <Input label="Cena v centoch" name="price" type="number" />
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
            "Aktualizovat listok"
          )}
        </Button>
      </form>
    </FormProvider>
  );
}
