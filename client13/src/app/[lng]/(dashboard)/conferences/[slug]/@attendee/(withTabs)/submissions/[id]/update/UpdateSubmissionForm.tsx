"use client";

import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { useContext } from "react";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { array, object, string } from "yup";
import { useTranslation } from "@/lib/i18n/client";
import Button from "@/components/Button";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  SectionFragment,
  SubmissionFragment,
} from "@/lib/graphql/generated/graphql";
import { LocalizedInput } from "@/components/Input";
import { LocalizedTextarea } from "@/components/Textarea";
import { updateSubmission } from "./actions";
import Select from "@/components/Select";
import {
  LocalizedMultipleInput,
  MultipleInput,
} from "@/components/MultipleInput";

export default function UpdateSubmissionForm({
  sections,
  submission,
  lng,
}: {
  lng: string;
  submission: SubmissionFragment;
  sections: SectionFragment[];
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
          name: submission.translations.sk.name,
          abstract: submission.translations.sk.abstract,
          keywords: submission.translations.sk.keywords,
        },
        en: {
          name: submission.translations.en.name,
          abstract: submission.translations.en.abstract,
          keywords: submission.translations.en.keywords,
        },
      },
      authors: [],
      conference: submission.conference.id,
      section: submission.section.id,
    },
  });

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6 w-full sm:w-96"
        onSubmit={methods.handleSubmit(async (data) => {
          const state = await updateSubmission(submission.id, data);

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
          label={t("registration.submission.keywords", { ns: "conferences" })}
          name={`translations.${lng}.keywords`}
        />
        <MultipleInput
          label={t("registration.submission.authors", { ns: "conferences" })}
          name="authors"
        />

        <Button
          color="primary"
          type="submit"
          fluid
          loading={methods.formState.isSubmitting}
          disabled={methods.formState.isSubmitting}
        >
          {t("update", { ns: "common" })}
        </Button>
      </form>
    </FormProvider>
  );
}
