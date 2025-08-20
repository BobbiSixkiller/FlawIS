"use client";

import { Input } from "@/components/Input";
import { createConference } from "./actions";
import { useTranslation } from "@/lib/i18n/client";
import { LocalizedTextarea } from "@/components/Textarea";
import { LocalizedImageFileInput } from "@/components/ImageFileInput";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import useValidation from "@/hooks/useValidation";
import { uploadToMinio } from "@/utils/helpers";
import { ConferenceInput } from "@/lib/graphql/generated/graphql";
import { deleteFiles } from "@/lib/minio";
import WizzardForm, { WizzardStep } from "@/components/WizzardForm";

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
    <WizzardForm<ConferenceInput & { logo: { sk?: File; en?: File } }>
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
      <WizzardStep
        name="O konferencii"
        yupSchema={yup.object({
          logo: yup.object({
            sk: yup
              .mixed<File>() // Pass in the type of `fileUpload`
              .test("required", t("required"), (file) => file !== undefined)
              .test(
                "fileSize",
                "Only documents up to 2MB are permitted.",
                (file) => file && file.size < 2_000_000
              ),
            en: yup
              .mixed<File>() // Pass in the type of `fileUpload`
              .test("required", t("required"), (file) => file !== undefined)
              .test(
                "fileSize",
                "Only documents up to 2MB are permitted.",
                (file) => file && file.size < 2_000_000
              ),
          }),
          translations: yup.object({
            sk: yup.object({
              name: yup.string().trim().required(),
            }),
            en: yup.object({
              name: yup.string().trim().required(),
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
        {(methods) => (
          <div className="space-y-6">
            <LocalizedTextarea
              lng={lng}
              label="Nazov"
              name={`translations.${lng}.name`}
            />
            <LocalizedImageFileInput
              lng={lng}
              label="Logo"
              name={`logo.${lng}`}
              control={methods.control}
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
          </div>
        )}
      </WizzardStep>
      <WizzardStep
        name="Fakturacne udaje"
        yupSchema={yup.object({
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
          }),
        })}
      >
        <div className="space-y-6">
          <Input label="Meno" name="billing.name" />
          <Input
            label="Ulica"
            name="billing.address.street"
            autoComplete="address-level1"
          />
          <Input
            label="Mesto"
            name="billing.address.city"
            autoComplete="address-level2"
          />
          <Input
            label="PSC"
            name="billing.address.postal"
            autoComplete="postal-code"
          />
          <Input
            label="Krajina"
            name="billing.address.country"
            autoComplete="country"
          />
          <Input label="Variabilny" name="billing.variableSymbol" />
          <Input label="IBAN" name="billing.IBAN" />
          <Input label="SWIFT" name="billing.SWIFT" />
          <Input label="ICO" name="billing.ICO" />
          <Input label="DIC" name="billing.DIC" />
          <Input label="ICDPH" name="billing.ICDPH" />
        </div>
      </WizzardStep>
    </WizzardForm>
  );
}
