"use client";

import {
  WizzardForm,
  WizzardStep,
  objectToFormData,
} from "@/components/WIzzardForm";
import { Input } from "@/components/Input";
import { createConference } from "./actions";
import { useTranslation } from "@/lib/i18n/client";
import { LocalizedTextarea } from "@/components/Textarea";
import ImageFileInput, {
  LocalizedImageFileInput,
} from "@/components/ImageFileInput";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import useValidation from "@/hooks/useValidation";

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
  const { t } = useTranslation(lng, "validation");
  const { yup } = useValidation();

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

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

        setMessage(state.message, state.success);

        if (state.success) {
          closeDialog(dialogId);
        }
      }}
    >
      <WizzardStep
        name="O konferencii"
        validationSchema={yup.object({
          translations: yup.object({
            sk: yup.object({
              name: yup.string().trim().required(),
              logo: yup
                .mixed<File>() // Pass in the type of `fileUpload`
                .test("required", t("required"), (file) => file !== undefined)
                .test(
                  "fileSize",
                  "Only documents up to 2MB are permitted.",
                  (file) => file && file.size < 2_000_000
                ),
            }),
            en: yup.object({
              name: yup.string().trim().required(),
              logo: yup
                .mixed<File>() // Pass in the type of `fileUpload`
                .test("required", t("required"), (file) => file !== undefined)
                .test(
                  "fileSize",
                  "Only documents up to 2MB are permitted.",
                  (file) => file && file.size < 2_000_000
                ),
            }),
          }),
          slug: yup.string().trim().required(),
          dates: yup.object({
            start: yup.date().typeError(t("date")),
            end: yup
              .date()
              .typeError(t("date"))
              .min(yup.ref("start"), t("endDateInvalid")),
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
        validationSchema={yup.object({
          billing: yup.object({
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
            stamp: yup
              .mixed<File>() // Pass in the type of `fileUpload`
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
