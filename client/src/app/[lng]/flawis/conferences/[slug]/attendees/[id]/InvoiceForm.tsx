"use client";
import { z } from "zod";

import { FormField } from "@/components/form";
import { inputChange, inputValue } from "@/components/form-values";

import Button from "@/components/Button";
import { FormContainer } from "@/components/form";
import { Input } from "@/components/Input";
import Spinner from "@/components/Spinner";
import { Textarea } from "@/components/Textarea";
import useValidation from "@/hooks/useValidation";
import { InvoiceInput } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import { useParams } from "next/navigation";
import { updateInvoice } from "./actions";

function withoutNull(value: string | null | undefined) {
  return value ?? undefined;
}

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

  const { v } = useValidation();
  const { t } = useTranslation(lng, "validation");

  const schema = z.object({
    issuer: z.object({
      name: v.string().trim().min(1, v.required),
      address: z.object({
        street: v.string().trim().min(1, v.required),
        city: v.string().trim().min(1, v.required),
        postal: v.string().trim().min(1, v.required),
        country: v.string().trim().min(1, v.required),
      }),
      variableSymbol: v.string().trim().min(1, v.required),
      IBAN: v.string().trim().nullable().optional(),
      SWIFT: v.string().trim().nullable().optional(),
      ICO: v.string().trim().nullable().optional(),
      DIC: v.string().trim().nullable().optional(),
      ICDPH: v.string().trim().nullable().optional(),
    }),
    payer: z.object({
      name: v.string().trim().min(1, v.required),
      address: z.object({
        street: v.string().trim().min(1, v.required),
        city: v.string().trim().min(1, v.required),
        postal: v.string().trim().min(1, v.required),
        country: v.string().trim().min(1, v.required),
      }),
      ICO: v.string().trim().nullable().optional(),
      DIC: v.string().trim().nullable().optional(),
      ICDPH: v.string().trim().nullable().optional(),
    }),
    body: z.object({
      body: v.string().trim().min(1, v.required),
      comment: v.string().trim().min(1, v.required),
      type: v.string().trim().min(1, v.required),
      issueDate: v.date(),
      dueDate: v.date(),
      vatDate: v.date(),
      price: v.number(),
      vat: v.number(),
    }),
  });
  type FormValues = z.input<typeof schema>;
  return (
    <FormContainer
      defaultValues={{
        issuer: {
          ...invoice.issuer,
          DIC: withoutNull(invoice.issuer.DIC),
          IBAN: withoutNull(invoice.issuer.IBAN),
          ICDPH: withoutNull(invoice.issuer.ICDPH),
          ICO: withoutNull(invoice.issuer.ICO),
          SWIFT: withoutNull(invoice.issuer.SWIFT),
          variableSymbol: withoutNull(invoice.issuer.variableSymbol),
        },
        body: {
          ...invoice.body,
          issueDate: new Date(invoice.body.issueDate),
          dueDate: new Date(invoice.body.dueDate),
          vatDate: new Date(invoice.body.vatDate),
        },
        payer: {
          ...invoice.payer,
          DIC: withoutNull(invoice.payer.DIC),
          ICDPH: withoutNull(invoice.payer.ICDPH),
          ICO: withoutNull(invoice.payer.ICO),
        },
      }}
      schema={schema}
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
          <FormField<FormValues, `payer.name`>
            name={`payer.name`}
            label="Fakturacne meno"
          >
            {({ field, controlProps }) => (
              <Textarea
                {...field}
                {...controlProps}
                value={field.value ?? ""}
              />
            )}
          </FormField>
          <FormField<FormValues, `payer.address.street`>
            name={`payer.address.street`}
            label="Ulica"
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
          </FormField>
          <FormField<FormValues, `payer.address.city`>
            name={`payer.address.city`}
            label="Mesto"
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
          </FormField>
          <FormField<FormValues, `payer.address.postal`>
            name={`payer.address.postal`}
            label="PSC"
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
          </FormField>
          <FormField<FormValues, `payer.address.country`>
            name={`payer.address.country`}
            label="Krajina"
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
          </FormField>
          <FormField<FormValues, `payer.ICO`> name={`payer.ICO`} label="ICO">
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
          </FormField>
          <FormField<FormValues, `payer.ICDPH`>
            name={`payer.ICDPH`}
            label="ICDPH"
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
          </FormField>
          <FormField<FormValues, `payer.DIC`> name={`payer.DIC`} label="DIC">
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
          </FormField>
          <FormField<FormValues, "body.issueDate">
            name="body.issueDate"
            label="Datum vystavenia"
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                type="date"
                value={inputValue(field.value, "date")}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>
          <FormField<FormValues, "body.vatDate">
            name="body.vatDate"
            label="Dátum zdaniteľného plnenia"
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                type="date"
                value={inputValue(field.value, "date")}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>
          <FormField<FormValues, "body.dueDate">
            name="body.dueDate"
            label="Uhradiť do"
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                type="date"
                value={inputValue(field.value, "date")}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>
          <FormField<FormValues, `body.body`> name={`body.body`} label="Telo">
            {({ field, controlProps }) => (
              <Textarea
                {...field}
                {...controlProps}
                value={field.value ?? ""}
              />
            )}
          </FormField>
          <FormField<FormValues, `body.comment`>
            name={`body.comment`}
            label="Komentar"
          >
            {({ field, controlProps }) => (
              <Textarea
                {...field}
                {...controlProps}
                value={field.value ?? ""}
              />
            )}
          </FormField>
          <FormField<FormValues, "body.price">
            name="body.price"
            label="Cena bez DPH v eurach"
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
          </FormField>
          <FormField<FormValues, "body.vat">
            name="body.vat"
            label="DPH v eurach"
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
          </FormField>

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
    </FormContainer>
  );
}
