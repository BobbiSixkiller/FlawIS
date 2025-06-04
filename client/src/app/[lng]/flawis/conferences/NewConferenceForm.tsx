"use client";

import {
  WizzardForm,
  WizzardStep,
  objectToFormData,
} from "@/components/WIzzardForm";
import { Input } from "@/components/Input";
import { createConference } from "./actions";
import { date, mixed, object, ref, string } from "yup";
import { useTranslation } from "@/lib/i18n/client";
import { useContext } from "react";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { LocalizedTextarea } from "@/components/Textarea";
import ImageFileInput, {
  LocalizedImageFileInput,
} from "@/components/ImageFileInput";
import { useDialogStore } from "@/stores/dialogStore";

export interface ConferenceInputType {
  slug: string;
  dates: { start: string; end: string };
  billing: {
    name: string;
    address: { street: string; city: string; postal: string; country: string };
    variableSymbol: string;
    ICO: string;
    DIC: string;
    ICDPH: string;
    IBAN: string;
    SWIFT: string;
    stamp?: File;
  };
  translations: {
    sk: { name: string; logo?: File };
    en: { name: string; logo?: File };
  };
}

export default function NewConferenceForm({
  lng,
  dialogId,
}: {
  lng: string;
  dialogId: string;
}) {
  const { dispatch } = useContext(MessageContext);

  const { t } = useTranslation(lng, "validation");

  const { closeDialog } = useDialogStore();

  return (
    <WizzardForm<ConferenceInputType>
      lng={lng}
      values={{
        slug: "",
        dates: { start: "", end: "" },
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
          stamp: undefined,
        },
        translations: {
          sk: { name: "", logo: undefined },
          en: { name: "", logo: undefined },
        },
      }}
      onSubmitCb={async (data) => {
        const formData = objectToFormData(data);
        const state = await createConference(formData);

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
      }}
    >
      <WizzardStep
        name="O konferencii"
        validationSchema={object({
          translations: object({
            sk: object({
              name: string().trim().required(t("required")),
              logo: mixed<File>() // Pass in the type of `fileUpload`
                .test("required", t("required"), (file) => file !== undefined)
                .test(
                  "fileSize",
                  "Only documents up to 2MB are permitted.",
                  (file) => file && file.size < 2_000_000
                ),
            }),
            en: object({
              name: string().trim().required(t("required")),
              logo: mixed<File>() // Pass in the type of `fileUpload`
                .test("required", t("required"), (file) => file !== undefined)
                .test(
                  "fileSize",
                  "Only documents up to 2MB are permitted.",
                  (file) => file && file.size < 2_000_000
                ),
            }),
          }),
          slug: string().trim().required(t("required")),
          dates: object({
            start: date().typeError(t("date")),
            end: date()
              .typeError(t("date"))
              .min(ref("start"), t("endDateInvalid")),
          }),
        })}
      >
        <LocalizedTextarea
          lng={lng}
          label="Nazov"
          name={`translations.${lng}.name`}
        />
        <LocalizedImageFileInput
          lng={lng}
          label="Logo"
          name={`translations.${lng}.logo`}
        />
        <Input label="Slug" name="slug" />
        <Input
          type="datetime-local"
          name="dates.start"
          label="Zaciatok konferencie"
        />
        <Input
          type="datetime-local"
          name="dates.end"
          label="Koniec konferencie"
        />
      </WizzardStep>
      <WizzardStep
        name="Fakturacne udaje"
        validationSchema={object({
          billing: object({
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
            stamp: mixed<File>() // Pass in the type of `fileUpload`
              .test("required", t("required"), (file) => file !== undefined)
              .test(
                "fileSize",
                "Only documents up to 2MB are permitted.",
                (file) => file && file.size < 2_000_000
              ),
          }),
        })}
      >
        <Input label="Meno" name="billing.name" />
        <Input label="Ulica" name="billing.address.street" />
        <Input label="Mesto" name="billing.address.city" />
        <Input label="PSC" name="billing.address.postal" />
        <Input label="Krajina" name="billing.address.country" />
        <Input label="Variabilny" name="billing.variableSymbol" />
        <Input label="IBAN" name="billing.IBAN" />
        <Input label="SWIFT" name="billing.SWIFT" />
        <Input label="ICO" name="billing.ICO" />
        <Input label="DIC" name="billing.DIC" />
        <Input label="ICDPH" name="billing.ICDPH" />
        <ImageFileInput label="Peciatka" name="billing.stamp" />
      </WizzardStep>
    </WizzardForm>
  );
}
