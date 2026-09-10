"use client";
import { z } from "zod";

import { FormField, LocalizedFormField } from "@/components/form";
import { inputChange, inputValue } from "@/components/form-values";
import { compareFields } from "@/lib/validation/form-validation";

import ImageFileInput from "@/components/ImageFileInput";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import WizzardForm, { WizzardStep } from "@/components/WizzardForm";
import useValidation from "@/hooks/useValidation";
import { uploadToMinio } from "@/lib/utilsClient";
import { useTranslation } from "@/lib/i18n/client";
import {
  normalizeVariableSymbolPrefix,
  VARIABLE_SYMBOL_PREFIX_MAX_LENGTH,
  VARIABLE_SYMBOL_PREFIX_PATTERN,
} from "@/lib/validation/invoice-validation";
import { deleteFiles } from "@/lib/minio";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import { createConference } from "./actions";

export default function NewConferenceForm({
  lng,
  dialogId,
}: {
  lng: string;
  dialogId: string;
}) {
  const { t } = useTranslation(lng, "validation");
  const { v } = useValidation();

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  const infoSchema = z.object({
    logo: z.object({
      sk: z
        .file({ error: v.required })
        .refine((file) => file !== undefined, t("required"))
        .refine(
          (file) => file && file.size < 2_000_000,
          "Only documents up to 2MB are permitted.",
        ),
      en: z
        .file({ error: v.required })
        .refine((file) => file !== undefined, t("required"))
        .refine(
          (file) => file && file.size < 2_000_000,
          "Only documents up to 2MB are permitted.",
        ),
    }),
    translations: z.object({
      sk: z.object({
        name: v.string().trim().min(1, v.required),
        logoUrl: z.string().nullish(),
      }),
      en: z.object({
        name: v.string().trim().min(1, v.required),
        logoUrl: z.string().nullish(),
      }),
    }),
    slug: v.string().trim().min(1, v.required),
    dates: compareFields(
      z.object({ start: v.date(), end: v.date() }),
      "end",
      "start",
      (value, other) => value == null || other == null || value >= other,
      t("endDateInvalid"),
    ),
  });
  const billingSchema = z.object({
    billing: z.object({
      name: v.string().trim().min(1, v.required),
      address: z.object({
        street: v.string().trim().min(1, v.required),
        city: v.string().trim().min(1, v.required),
        postal: v.string().trim().min(1, v.required),
        country: v.string().trim().min(1, v.required),
      }),
      variableSymbol: v
        .string()
        .trim()
        .refine(
          (value) => !value || VARIABLE_SYMBOL_PREFIX_PATTERN.test(value),
          t("variableSymbol"),
        )
        .min(1, v.required),
      IBAN: v.string().trim().min(1, v.required),
      SWIFT: v.string().trim().min(1, v.required),
      ICO: v.string().trim().min(1, v.required),
      DIC: v.string().trim().min(1, v.required),
      ICDPH: v.string().trim().min(1, v.required),
    }),
  });
  const schema = z.intersection(infoSchema, billingSchema);
  type FormValues = z.input<typeof schema>;
  type FormOutput = z.output<typeof schema>;
  return (
    <WizzardForm
      schema={schema}
      lng={lng}
      defaultValues={{
        slug: "",
        dates: { start: undefined, end: undefined },
        billing: {
          name: "",
          address: {
            street: "",
            city: "",
            postal: "",
            country: "",
          },
          variableSymbol: "",
          ICO: "",
          DIC: "",
          ICDPH: "",
          IBAN: "",
          SWIFT: "",
        },
        translations: {
          sk: { name: "", logoUrl: "" },
          en: { name: "", logoUrl: "" },
        },
        logo: { sk: undefined, en: undefined },
      }}
      onSubmitCb={async (data) => {
        console.log(data);
        const [logoUrlSk, logoUrlEn] = await Promise.all([
          uploadToMinio("images", data.logo.sk!.name, data.logo.sk!),
          uploadToMinio("images", data.logo.en!.name, data.logo.en!),
        ]);

        const res = await createConference({
          data: {
            slug: data.slug,
            billing: data.billing,
            dates: data.dates,
            translations: {
              sk: { name: data.translations.sk.name, logoUrl: logoUrlSk },
              en: { name: data.translations.en.name, logoUrl: logoUrlEn },
            },
          },
        });

        if (!res.success) {
          await deleteFiles([logoUrlSk, logoUrlEn]);
        }

        if (res.errors) {
          setMessage(res.message, res.success);
          throw res.errors;
        }

        setMessage(res.message, res.success);
        if (res.success) {
          closeDialog(dialogId);
        }
      }}
    >
      <WizzardStep<FormValues, FormOutput>
        name="O konferencii"
        id="info"
        fields={["logo", "translations", "slug", "dates"]}
      >
        {(methods) => (
          <div className="space-y-6">
            <LocalizedFormField<FormValues, `translations.${"sk" | "en"}.name`>
              name={`translations.${lng as "sk" | "en"}.name`}
              lng={lng}
              label="Nazov"
            >
              {({ field, controlProps }) => (
                <Textarea
                  {...field}
                  {...controlProps}
                  value={field.value ?? ""}
                />
              )}
            </LocalizedFormField>
            <LocalizedFormField<FormValues, `logo.${"sk" | "en"}`>
              name={`logo.${lng as "sk" | "en"}`}
              lng={lng}
            >
              {({ field, controlProps, initialize, onError }) => (
                <ImageFileInput
                  {...field}
                  {...controlProps}
                  onLoad={(file) => {
                    if (file) initialize(file);
                  }}
                  onError={onError}
                  buttonLabel={"Logo"}
                  aria-label={"Logo"}
                />
              )}
            </LocalizedFormField>
            <FormField<FormValues, "slug"> name="slug" label="Slug">
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
            <FormField<FormValues, "dates.start">
              name="dates.start"
              label="Zaciatok konferencie"
            >
              {({ field, controlProps }) => (
                <Input
                  {...field}
                  {...controlProps}
                  type="datetime-local"
                  value={inputValue(field.value, "datetime-local")}
                  onChange={(event) => {
                    field.onChange(inputChange(event));
                  }}
                />
              )}
            </FormField>
            <FormField<FormValues, "dates.end">
              name="dates.end"
              label="Koniec konferencie"
            >
              {({ field, controlProps }) => (
                <Input
                  {...field}
                  {...controlProps}
                  type="datetime-local"
                  value={inputValue(field.value, "datetime-local")}
                  onChange={(event) => {
                    field.onChange(inputChange(event));
                  }}
                />
              )}
            </FormField>
          </div>
        )}
      </WizzardStep>
      <WizzardStep<FormValues, FormOutput>
        name="Fakturacne udaje"
        id="billing"
        fields={["billing"]}
      >
        <div className="space-y-6">
          <FormField<FormValues, "billing.name">
            name="billing.name"
            label="Meno"
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
          <FormField<FormValues, "billing.address.street">
            name="billing.address.street"
            label="Ulica"
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                autoComplete="address-level1"
                value={inputValue(field.value, undefined)}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>
          <FormField<FormValues, "billing.address.city">
            name="billing.address.city"
            label="Mesto"
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                autoComplete="address-level2"
                value={inputValue(field.value, undefined)}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>
          <FormField<FormValues, "billing.address.postal">
            name="billing.address.postal"
            label="PSC"
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                autoComplete="postal-code"
                value={inputValue(field.value, undefined)}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>
          <FormField<FormValues, "billing.address.country">
            name="billing.address.country"
            label="Krajina"
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                autoComplete="country"
                value={inputValue(field.value, undefined)}
                onChange={(event) => {
                  field.onChange(inputChange(event));
                }}
              />
            )}
          </FormField>
          <FormField<FormValues, "billing.variableSymbol">
            name="billing.variableSymbol"
            label="Variabilny"
          >
            {({ field, controlProps }) => (
              <Input
                {...field}
                {...controlProps}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={VARIABLE_SYMBOL_PREFIX_MAX_LENGTH}
                value={inputValue(field.value, undefined)}
                onChange={(event) => {
                  field.onChange(
                    inputChange(event, normalizeVariableSymbolPrefix),
                  );
                }}
              />
            )}
          </FormField>
          <FormField<FormValues, "billing.IBAN">
            name="billing.IBAN"
            label="IBAN"
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
          <FormField<FormValues, "billing.SWIFT">
            name="billing.SWIFT"
            label="SWIFT"
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
          <FormField<FormValues, "billing.ICO"> name="billing.ICO" label="ICO">
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
          <FormField<FormValues, "billing.DIC"> name="billing.DIC" label="DIC">
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
          <FormField<FormValues, "billing.ICDPH">
            name="billing.ICDPH"
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
        </div>
      </WizzardStep>
    </WizzardForm>
  );
}
