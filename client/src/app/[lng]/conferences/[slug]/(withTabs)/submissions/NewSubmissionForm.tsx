"use client";

import { useTranslation } from "@/lib/i18n/client";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { LocalizedTextarea } from "@/components/Textarea";
import Button from "@/components/Button";
import {
  PresentationLng,
  SectionFragment,
} from "@/lib/graphql/generated/graphql";
import Select from "@/components/Select";
import {
  LocalizedMultipleInput,
  MultipleInput,
} from "@/components/MultipleInput";
import Spinner from "@/components/Spinner";
import useValidation from "@/hooks/useValidation";
import { useDialogStore } from "@/stores/dialogStore";
import { createSubmission } from "./actions";
import { FormMessage } from "@/components/Message";
import { useMessageStore } from "@/stores/messageStore";

export default function NewSubmissionForm({
  conferenceId,
  sections,
  lng,
  dialogId,
}: {
  conferenceId: string;
  sections: SectionFragment[];
  lng: string;
  dialogId: string;
}) {
  const { dispatch } = useContext(MessageContext);

  const { t } = useTranslation(lng, ["validation", "common", "conferences"]);

  const { yup } = useValidation();

  const methods = useForm({
    resolver: yupResolver(
      yup
        .object({
          conference: yup.string().required(),
          section: yup.string().required(),
          presentationLng: yup.string<PresentationLng>().required(),
          authors: yup.array().of(yup.string().email().required()).default([]),
          translations: yup.object({
            sk: yup.object({
              name: yup.string().trim().required(),
              abstract: yup.string().trim().required(),
              keywords: yup
                .array()
                .of(yup.string().required().trim())
                .min(1, (val) => t("keywords", { value: val.min }))
                .required(),
            }),
            en: yup.object({
              name: yup.string().trim().required(),
              abstract: yup.string().trim().required(),
              keywords: yup
                .array()
                .of(yup.string().required().trim())
                .min(1, (val) => t("keywords", { value: val.min }))
                .required(),
            }),
          }),
        })
        .required()
    ),
    values: {
      translations: {
        sk: {
          name: "",
          abstract: "",
          keywords: [],
        },
        en: {
          name: "",
          abstract: "",
          keywords: [],
        },
      },
      authors: [],
      conference: conferenceId,
      section: "",
      presentationLng: "" as PresentationLng,
    },
  });

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6 w-full sm:w-96"
        onSubmit={methods.handleSubmit(async (data) => {
          const state = await createSubmission(data);
          console.log(state);

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
        })}
      >
        <Select
          name="section"
          label={t("registration.submission.section", { ns: "conferences" })}
          options={sections.map((s) => ({
            name: s.translations[lng as "sk" | "en"].name,
            value: s.id,
          }))}
        />
        <LocalizedTextarea
          lng={lng}
          label={t("registration.submission.name", { ns: "conferences" })}
          name={`translations.${lng}.name`}
        />
        <LocalizedTextarea
          lng={lng}
          label={t("registration.submission.abstract", { ns: "conferences" })}
          name={`translations.${lng}.abstract`}
        />
        <LocalizedMultipleInput
          lng={lng}
          label={t("registration.submission.keywords.label", {
            ns: "conferences",
          })}
          placeholder={t("registration.submission.keywords.placeholder", {
            ns: "conferences",
          })}
          name={`translations.${lng}.keywords`}
        />
        <Select
          name="presentationLng"
          label={t("registration.submission.lng", { ns: "conferences" })}
          options={[
            { name: PresentationLng.Sk, value: PresentationLng.Sk },
            { name: PresentationLng.Cz, value: PresentationLng.Cz },
            { name: PresentationLng.En, value: PresentationLng.En },
          ]}
        />
        <MultipleInput
          label={t("registration.submission.authors.label", {
            ns: "conferences",
          })}
          placeholder={t("registration.submission.authors.placeholder", {
            ns: "conferences",
          })}
          name="authors"
        />
        <Button
          color="primary"
          type="submit"
          className="w-full"
          disabled={methods.formState.isSubmitting}
        >
          {methods.formState.isSubmitting ? (
            <Spinner inverted />
          ) : (
            t("create", { ns: "common" })
          )}
        </Button>
      </form>
    </FormProvider>
  );
}
