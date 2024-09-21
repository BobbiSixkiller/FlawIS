"use client";

import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { useContext, useEffect } from "react";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { array, mixed, object, string } from "yup";
import { useTranslation } from "@/lib/i18n/client";
import Button from "@/components/Button";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  SectionFragment,
  SubmissionFragment,
} from "@/lib/graphql/generated/graphql";
import { LocalizedTextarea } from "@/components/Textarea";
import {
  deleteSubmissionFile,
  updateSubmission,
  uploadSubmissionFile,
} from "./actions";
import Select from "@/components/Select";
import {
  LocalizedMultipleInput,
  MultipleInput,
} from "@/components/MultipleInput";
import MultipleFileUploadField from "@/components/MultipleFileUploadField";
import { objectToFormData } from "@/components/WIzzardForm";
import { deleteFiles } from "@/lib/minio";

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

  useEffect(() => {
    const fetchFiles = async () => {
      const response = await fetch(
        `/conferences/${submission.conference.slug}/submissions/${submission.id}/download`
      );
      const blob = await response.blob();
      const fileName = submission.fileUrl?.split("/").pop() || "file";
      const file = new File([blob], fileName);

      methods.setValue("files", [file]);
    };

    if (submission.fileUrl) {
      fetchFiles();
    }
  }, [submission]);

  const methods = useForm({
    resolver: yupResolver(
      object({
        conference: string().required(t("required")),
        section: string().required(t("required")),
        authors: array()
          .of(string().email().required(t("required")))
          .default([]),
        files: array()
          .of(mixed<File>())
          .max(1, (val) => t("maxFiles", { value: val.max })),
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
      files: [],
      conference: submission.conference.id,
      section: submission.section.id,
    },
  });

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6 w-full sm:w-96"
        onSubmit={methods.handleSubmit(
          async ({ authors, conference, section, translations, files }) => {
            let fileUrl: string | null = null;
            const slug = submission.conference.slug;

            if (files && submission.fileUrl) {
              await deleteSubmissionFile(
                submission.fileUrl,
                slug,
                submission.id
              );

              const formData = objectToFormData({
                files,
                section: submission.section.translations.sk.name,
                conferenceSlug: submission.conference.slug,
              });
              const res = await uploadSubmissionFile(formData);
              fileUrl = res[0];
            } else if (files && !submission.fileUrl) {
              const formData = objectToFormData({
                files,
                section: submission.section.translations.sk.name,
                conferenceSlug: submission.conference.slug,
              });
              const res = await uploadSubmissionFile(formData);
              fileUrl = res[0];
            } else if ((files?.length === 0 || !files) && submission.fileUrl) {
              await deleteSubmissionFile(
                submission.fileUrl,
                slug,
                submission.id
              );
            }

            const state = await updateSubmission(submission.id, {
              authors,
              conference,
              section,
              translations,
              fileUrl,
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
          defaultSelected={submission.section.id}
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
          disabled={methods.formState.isSubmitting}
        >
          {t("update", { ns: "common" })}
        </Button>
      </form>
    </FormProvider>
  );
}
