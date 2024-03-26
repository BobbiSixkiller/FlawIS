"use client";

import Button from "@/components/Button";
import Modal from "@/components/Modal";
import {
  Input,
  WizzardForm,
  WizzardStep,
  objectToFormData,
} from "@/components/WIzzardForm";
import { useTranslation } from "@/lib/i18n/client";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useContext, useState } from "react";
import { date, mixed, object, ref, string } from "yup";
import { createConference } from "./actions";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { Message } from "@/components/Message";

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

export default function AddConference({ lng }: { lng: string }) {
  const [open, setOpen] = useState(false);

  const { t } = useTranslation(lng, "validation");

  const { dispatch, dialogOpen } = useContext(MessageContext);

  return (
    <>
      <Button color="primary" type="button" onClick={() => setOpen(true)}>
        <PlusIcon className="mr-2 h-4 w-4" aria-hidden="true" />
        Nova
      </Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Nova konferencia"
      >
        {dialogOpen && <Message lng={lng} />}

        <WizzardForm<ConferenceInputType>
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
            const { message, success } = await createConference(formData);

            dispatch({
              type: ActionTypes.SetMsg,
              payload: {
                positive: success,
                dialogOpen: !success,
                content: message,
              },
            });

            if (success) {
              setOpen(false);
            }
          }}
        >
          <WizzardStep
            validationSchema={object({
              translations: object({
                sk: object({
                  name: string().trim().required(t("required")),
                  logo: mixed<FileList>() // Pass in the type of `fileUpload`
                    .test(
                      "required",
                      t("required"),
                      (files) => files && files.length !== 0
                    )
                    .test(
                      "fileSize",
                      "Only documents up to 2MB are permitted.",
                      (files) =>
                        files &&
                        files.length !== 0 && // Check if `files` is not an empty list
                        files[0].size < 2_000_000
                    ),
                }),
                en: object({
                  name: string().trim().required(t("required")),
                  logo: mixed<FileList>() // Pass in the type of `fileUpload`
                    .test(
                      "required",
                      t("required"),
                      (files) => files && files.length !== 0
                    )
                    .test(
                      "fileSize",
                      "Only documents up to 2MB are permitted.",
                      (files) =>
                        files &&
                        files.length !== 0 && // Check if `files` is not an empty list
                        files[0].size < 2_000_000
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
            <Input lng={lng} label="Meno" name={`translations.${lng}.name`} />
            <Input
              lng={lng}
              label="Logo"
              name={`translations.${lng}.logo`}
              type="file"
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
                stamp: mixed<FileList>() // Pass in the type of `fileUpload`
                  .test(
                    "required",
                    t("required"),
                    (files) => files && files.length !== 0
                  )
                  .test(
                    "fileSize",
                    "Only documents up to 2MB are permitted.",
                    (files) =>
                      files &&
                      files.length !== 0 && // Check if `files` is not an empty list
                      files[0].size < 2_000_000
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
            <Input label="Peciatka" name="billing.stamp" type="file" />
          </WizzardStep>
        </WizzardForm>
      </Modal>
    </>
  );
}
