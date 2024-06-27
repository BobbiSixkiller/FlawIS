"use client";

import { useTranslation } from "@/lib/i18n/client";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { array, object, string } from "yup";
import { createSubmission } from "./actions";
import { LocalizedInput } from "@/components/Input";
import { LocalizedTextarea } from "@/components/Textarea";
import Button from "@/components/Button";
import { SectionFragment } from "@/lib/graphql/generated/graphql";
import Select from "@/components/Select";
import {
  LocalizedMultipleInput,
  MultipleInput,
} from "@/components/MultipleInput";

export default function NewSubmissionForm({
  conferenceId,
  sections,
  lng,
}: {
  conferenceId: string;
  sections: SectionFragment[];
  lng: string;
}) {
  const router = useRouter();

  const { dispatch } = useContext(MessageContext);

  const { t } = useTranslation(lng, ["validation", "common", "conferences"]);

  const methods = useForm({
    resolver: yupResolver(
      object({
        conference: string().required(t("required")),
        section: string().required(t("required")),
        authors: array()
          .of(string().email().required(t("required")))
          .default([]),
        translations: object({
          sk: object({
            name: string().trim().required(t("required")),
            abstract: string().trim().required(t("required")),
            keywords: array()
              .of(string().required().trim())
              .min(1, (val) => t("keywords", { value: val.min }))
              .required(),
          }),
          en: object({
            name: string().trim().required(t("required")),
            abstract: string().trim().required(t("required")),
            keywords: array()
              .of(string().required().trim())
              .min(1, (val) => t("keywords", { value: val.min }))
              .required(),
          }),
        }),
      }).required(t("required"))
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
    },
  });

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6 w-full sm:w-96"
        onSubmit={methods.handleSubmit(async (data) => {
          const state = await createSubmission(data);

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
            router.back();
          }
        })}
      >
        <Select
          name="section"
          label={t("registration.submission.section", { ns: "conferences" })}
          defaultSelected={sections[0].id}
          options={sections.map((s) => ({
            name: s.translations[lng as "sk" | "en"].name,
            value: s.id,
          }))}
        />
        <LocalizedInput
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
          fluid
          loading={methods.formState.isSubmitting}
          disabled={methods.formState.isSubmitting}
        >
          {t("create", { ns: "common" })}
        </Button>
      </form>
    </FormProvider>
  );
}
