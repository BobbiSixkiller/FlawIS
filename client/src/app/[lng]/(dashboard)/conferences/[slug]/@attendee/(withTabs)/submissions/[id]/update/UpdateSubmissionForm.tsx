"use client";

import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { useContext, useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(
          `/minio?bucketName=${submission.conference.slug}&objectName=${submission.fileUrl}`
        );
        // Check if the response is OK (status code 200-299)
        if (!response.ok) {
          const errorMessage = await response.json(); // Parse the JSON body
          throw new Error(errorMessage.message || "Unknown error occurred");
        }

        const blob = await response.blob();
        const fileType = blob.type || "application/octet-stream";

        const fileName = submission.fileUrl?.split("/").pop() || "file";
        const fileNameArr = fileName.split("-");

        const file = new File([blob], fileNameArr[fileNameArr.length - 1], {
          type: fileType,
        });

        methods.setValue("files", [file]);
      } catch (error: any) {
        console.log(error.message);
        methods.setError("files", { message: error.message });
      }

      setLoadingFile(false);
    };

    if (submission.fileUrl) {
      fetchFiles();
    } else setLoadingFile(false);
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
        className="space-y-6 w-80 sm:w-96"
        onSubmit={methods.handleSubmit(
          async ({ authors, conference, section, translations, files }) => {
            let fileUrl: string | undefined | null;
            const slug = submission.conference.slug;

            if (
              files &&
              submission.fileUrl &&
              submission.fileUrl.split("-").pop() !== files[0]?.name
            ) {
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
            } else if (!files && submission.fileUrl) {
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
          disabled={methods.formState.isSubmitting || loadingFile}
        >
          {t("update", { ns: "common" })}
        </Button>
      </form>
    </FormProvider>
  );
}
