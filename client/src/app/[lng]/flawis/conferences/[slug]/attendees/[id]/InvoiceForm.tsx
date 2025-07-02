"use client";

import { useParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { date, number, object, string } from "yup";
import { useTranslation } from "@/lib/i18n/client";
import Button from "@/components/Button";
import { yupResolver } from "@hookform/resolvers/yup";
import { InvoiceInput } from "@/lib/graphql/generated/graphql";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import Spinner from "@/components/Spinner";
import { useDialogStore } from "@/stores/dialogStore";
import { updateInvoice } from "./actions";
import { useMessageStore } from "@/stores/messageStore";

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

  const { t } = useTranslation(lng, "validation");

  const methods = useForm({
    resolver: yupResolver(
      object({
        issuer: object({
          name: string().trim().required(t("required")),
          address: object({
            street: string().trim().required(t("required")),
            city: string().trim().required(t("required")),
            postal: string().trim().required(t("required")),
            country: string().trim().required(t("required")),
          }),
          variableSymbol: string().trim().required(t("required")),
          IBAN: string().trim().required(t("required")),
          SWIFT: string().trim().required(t("required")),
          ICO: string().trim().required(t("required")),
          DIC: string().trim().required(t("required")),
          ICDPH: string().trim().required(t("required")),
        }).required(t("required")),
        payer: object({
          name: string().trim().required(t("required")),
          address: object({
            street: string().trim().required(t("required")),
            city: string().trim().required(t("required")),
            postal: string().trim().required(t("required")),
            country: string().trim().required(t("required")),
          }),
          ICO: string().trim().nullable(),
          DIC: string().trim().nullable(),
          ICDPH: string().trim().nullable(),
        }).required(t("required")),
        body: object({
          body: string().trim().required(t("required")),
          comment: string().trim().required(t("required")),
          type: string().trim().required(t("required")),
          issueDate: date().typeError(t("date")).required(t("required")),
          dueDate: date().typeError(t("date")).required(t("required")),
          vatDate: date().typeError(t("date")).required(t("required")),
          price: number().required(t("required")),
          vat: number().required(t("required")),
        }).required(t("required")),
      }).required(t("required"))
    ),
    values: {
      issuer: invoice.issuer,
      body: {
        ...invoice.body,
        issueDate: invoice.body.issueDate.toString().split("T")[0],
        dueDate: invoice.body.dueDate.toString().split("T")[0],
        vatDate: invoice.body.vatDate.toString().split("T")[0],
      },
      payer: invoice.payer,
    },
  });

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6"
        onSubmit={methods.handleSubmit(async (data) => {
          const state = await updateInvoice(id, data);

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
    </FormProvider>
  );
}
