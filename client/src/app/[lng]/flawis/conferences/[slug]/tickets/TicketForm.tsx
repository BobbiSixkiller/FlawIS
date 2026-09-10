"use client";
import { z } from "zod";

import { FormField, LocalizedFormField } from "@/components/form";
import { inputChange, inputValue } from "@/components/form-values";

import Button from "@/components/Button";
import CheckBox from "@/components/Checkbox";
import { FormContainer } from "@/components/form";
import { Input } from "@/components/Input";
import Spinner from "@/components/Spinner";
import { Textarea } from "@/components/Textarea";
import useValidation from "@/hooks/useValidation";
import { TicketFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import { useParams } from "next/navigation";
import { createTicket, updateTicket } from "./actions";

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

  const { v } = useValidation();

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  const schema = z.object({
    online: z.boolean({ error: v.required }),
    withSubmission: z.boolean({ error: v.required }),
    price: v.number().min(100, t("min", { value: 100 })),
    translations: z.object({
      sk: z.object({
        name: v.string().trim().min(1, t("required")),
        description: v.string().trim().min(1, t("required")),
      }),
      en: z.object({
        name: v.string().trim().min(1, t("required")),
        description: v.string().trim().min(1, t("required")),
      }),
    }),
  });
  type FormValues = z.input<typeof schema>;
  return (
    <FormContainer
      defaultValues={{
        online: ticket?.online || false,
        withSubmission: ticket?.withSubmission || false,
        price: ticket?.price || 0,
        translations: ticket?.translations || {
          en: { name: "", description: "" },
          sk: { name: "", description: "" },
        },
      }}
      schema={schema}
    >
      {(methods) => (
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
          <LocalizedFormField<FormValues, `translations.${"sk" | "en"}.name`>
            name={`translations.${lng as "sk" | "en"}.name`}
            lng={lng}
            label="Nazov listku"
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                value={inputValue(field.value, undefined)}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </LocalizedFormField>
          <LocalizedFormField<
            FormValues,
            `translations.${"sk" | "en"}.description`
          >
            name={`translations.${lng as "sk" | "en"}.description`}
            lng={lng}
            label="Popis listku"
          >
            {({ field, controlProps }) => (
              <Textarea
                {...field}
                {...controlProps}
                value={field.value ?? ""}
              />
            )}
          </LocalizedFormField>
          <FormField<FormValues, "price">
            name="price"
            label="Cena v centoch s DPH"
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                type="number"
                value={inputValue(field.value, "number")}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>
          <FormField<FormValues, "online">
            name="online"
            label="Online"
            layout="inline"
          >
            {({ field, controlProps }) => (
              <CheckBox
                {...field}
                {...controlProps}
                checked={Boolean(field.value)}
              />
            )}
          </FormField>
          <FormField<FormValues, "withSubmission">
            name="withSubmission"
            label="S prispevkom"
            layout="inline"
          >
            {({ field, controlProps }) => (
              <CheckBox
                {...field}
                {...controlProps}
                checked={Boolean(field.value)}
              />
            )}
          </FormField>

          <Button
            color="primary"
            type="submit"
            className="w-full"
            disabled={methods.formState.isSubmitting}
          >
            {methods.formState.isSubmitting ? (
              <Spinner inverted />
            ) : ticket ? (
              "Aktualizovat listok"
            ) : (
              "Vytvorit listok"
            )}
          </Button>
        </form>
      )}
    </FormContainer>
  );
}
