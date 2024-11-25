"use client";

import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { useCallback, useContext, useEffect, useState } from "react";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { useTranslation } from "@/lib/i18n/client";
import Button from "@/components/Button";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  PresentationLng,
  SectionFragment,
  SubmissionFragment,
} from "@/lib/graphql/generated/graphql";
import { LocalizedTextarea } from "@/components/Textarea";
import { updateSubmission } from "./actions";
import Select from "@/components/Select";
import {
  LocalizedMultipleInput,
  MultipleInput,
} from "@/components/MultipleInput";
import MultipleFileUploadField from "@/components/MultipleFileUploadField";
import { fetchFromMinio, uploadOrDelete } from "@/utils/helpers";
import useValidation from "@/hooks/useValidation";

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

  const [loadingFile, setLoadingFile] = useState(true);

  const fetchFiles = useCallback(async () => {
    try {
      if (submission.fileUrl) {
        const file = await fetchFromMinio(
          submission.conference.slug,
          submission.fileUrl
        );
        methods.setValue("files", [file]);
      }
      setLoadingFile(false);
    } catch (error: any) {
      console.log(error.message);
      methods.setError("files", { message: error.message });
      setLoadingFile(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, []);

  const { yup } = useValidation();

  const methods = useForm({
    resolver: yupResolver(
      yup
        .object({
          conference: yup.string().required(),
          section: yup.string().required(),
          authors: yup.array().of(yup.string().email().required()).default([]),
          files: yup
            .array()
            .of(yup.mixed<File>().required())
            .required()
            .max(1, (val) => t("maxFiles", { value: val.max })),
          presentationLng: yup.string<PresentationLng>().required(),
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
    defaultValues: {
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
      files: [],
      conference: submission.conference.id,
      section: submission.section.id,
      presentationLng: (submission.presentationLng || "") as PresentationLng,
    },
  });

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6 w-80 sm:w-96"
        onSubmit={methods.handleSubmit(
          async ({
            authors,
            conference,
            section,
            translations,
            files,
            presentationLng,
          }) => {
            const { error, url } = await uploadOrDelete(
              submission.conference.slug,
              submission.fileUrl,
              files[0],
              submission.section.translations.sk.name
            );
            if (error) {
              return methods.setError("files", { message: error });
            }

            const state = await updateSubmission(submission.id, {
              authors,
              conference,
              section,
              translations,
              presentationLng,
              fileUrl: url,
            });

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
          }
        )}
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
        <MultipleFileUploadField
          label={t("registration.submission.file", {
            ns: "conferences",
          })}
          name="files"
          maxFiles={1}
          accept={{
            "application/pdf": [".pdf"],
            "application/msword": [".doc"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
              [".docx"],
          }}
        />

        <Button
          color="primary"
          type="submit"
          fluid
          loading={methods.formState.isSubmitting}
          disabled={methods.formState.isSubmitting || loadingFile}
        >
          {t("update", { ns: "common" })}
        </Button>
      </form>
    </FormProvider>
  );
}