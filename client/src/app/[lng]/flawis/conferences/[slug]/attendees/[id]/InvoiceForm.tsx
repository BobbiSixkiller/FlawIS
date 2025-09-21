"use client";

import { useParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";
import Button from "@/components/Button";
import { InvoiceInput } from "@/lib/graphql/generated/graphql";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import Spinner from "@/components/Spinner";
import { useDialogStore } from "@/stores/dialogStore";
import { updateInvoice } from "./actions";
import { useMessageStore } from "@/stores/messageStore";
import RHFormContainer from "@/components/RHFormContainer";
import useValidation from "@/hooks/useValidation";
import { getLocalDate } from "@/utils/helpers";

export default function UpdateInvoiceForm({
  invoice,
  lng,
  dialogId,
}: {
  lng: string;
  invoice: InvoiceInput;
  dialogId: string;
}) {
  const { id } = useParams<{ id: string }>();

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  const { yup } = useValidation();
  const { t } = useTranslation(lng, "validation");

  return (
    <RHFormContainer
      defaultValues={{
        issuer: invoice.issuer,
        body: {
          ...invoice.body,
          issueDate: getLocalDate(invoice.body.issueDate) as unknown as Date,
          dueDate: getLocalDate(invoice.body.dueDate) as unknown as Date,
          vatDate: getLocalDate(invoice.body.vatDate) as unknown as Date,
        },
        payer: invoice.payer,
      }}
      yupSchema={yup.object({
        issuer: yup.object({
          name: yup.string().trim().required(),
          address: yup.object({
            street: yup.string().trim().required(),
            city: yup.string().trim().required(),
            postal: yup.string().trim().required(),
            country: yup.string().trim().required(),
          }),
          variableSymbol: yup.string().trim().required(),
          IBAN: yup.string().trim().required(),
          SWIFT: yup.string().trim().required(),
          ICO: yup.string().trim().required(),
          DIC: yup.string().trim().required(),
          ICDPH: yup.string().trim().required(),
        }),
        payer: yup.object({
          name: yup.string().trim().required(),
          address: yup.object({
            street: yup.string().trim().required(),
            city: yup.string().trim().required(),
            postal: yup.string().trim().required(),
            country: yup.string().trim().required(),
          }),
          ICO: yup.string().trim().nullable(),
          DIC: yup.string().trim().nullable(),
          ICDPH: yup.string().trim().nullable(),
        }),
        body: yup.object({
          body: yup.string().trim().required(),
          comment: yup.string().trim().required(),
          type: yup.string().trim().required(),
          issueDate: yup.date().typeError(t("date")).required(),
          dueDate: yup.date().typeError(t("date")).required(),
          vatDate: yup.date().typeError(t("date")).required(),
          price: yup.number().required(),
          vat: yup.number().required(),
        }),
      })}
    >
      {(methods) => (
        <form
          className="space-y-6"
          onSubmit={methods.handleSubmit(async (data) => {
            const state = await updateInvoice({ id, data });

            setMessage(state.message, state.success);

            if (state.success) {
              closeDialog(dialogId);
            }
          })}
        >
          <Textarea label="Fakturacne meno" name={`payer.name`} />
          <Input label="Ulica" name={`payer.address.street`} />
          <Input label="Mesto" name={`payer.address.city`} />
          <Input label="PSC" name={`payer.address.postal`} />
          <Input label="Krajina" name={`payer.address.country`} />
          <Input label="ICO" name={`payer.ICO`} />
          <Input label="ICDPH" name={`payer.ICDPH`} />
          <Input label="DIC" name={`payer.DIC`} />
          <Input type="date" name="body.issueDate" label="Datum vystavenia" />
          <Input
            type="date"
            name="body.vatDate"
            label="Dátum zdaniteľného plnenia"
          />
          <Input type="date" name="body.dueDate" label="Uhradiť do" />
          <Textarea label="Telo" name={`body.body`} />
          <Textarea label="Komentar" name={`body.comment`} />
          <Input label="Cena bez DPH v eurach" name="body.price" />
          <Input label="DPH v eurach" name="body.vat" />

          <Button
            color="primary"
            type="submit"
            className="w-full"
            disabled={methods.formState.isSubmitting}
          >
            {methods.formState.isSubmitting ? (
              <Spinner inverted />
            ) : (
              "Aktualizovat fakturu"
            )}
          </Button>
        </form>
      )}
    </RHFormContainer>
  );
}
