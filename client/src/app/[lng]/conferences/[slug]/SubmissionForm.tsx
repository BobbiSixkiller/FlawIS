"use client";
import { z } from "zod";

import { FormField, LocalizedFormField } from "@/components/form";

import Button from "@/components/Button";
import { FormContainer } from "@/components/form";
import GenericCombobox from "@/components/GenericCombobox";
import MultipleFileUploadField from "@/components/MultipleFileUploadField";
import Select from "@/components/Select";
import Spinner from "@/components/Spinner";
import { Textarea } from "@/components/Textarea";
import useValidation from "@/hooks/useValidation";
import { handleAPIErrors, uploadOrDelete } from "@/lib/utilsClient";
import {
  ConferenceQuery,
  PresentationLng,
  SubmissionFragment,
} from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import { omit } from "lodash";
import { createSubmission, updateSubmission } from "./actions";

export default function ConferenceSubmissionForm({
  submission,
  conference,
  lng,
  dialogId,
  attendeeId,
}: {
  lng: string;
  submission?: SubmissionFragment;
  conference: Pick<ConferenceQuery["conference"], "id" | "slug" | "sections">;
  dialogId: string;
  attendeeId?: string;
}) {
  const { t } = useTranslation(lng, ["validation", "common", "conferences"]);

  const { v } = useValidation();

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  const schema = z.object({
    conference: v.string().min(1, v.required),
    section: v.string().min(1, v.required),
    authors: z.array(v.string().email(v.email).min(1, v.required)).default([]),
    files: z
      .array(z.file({ error: v.required }))
      .max(1, t("maxFiles", { value: 1 })),
    presentationLng: z.enum(PresentationLng, { error: v.required }),
    translations: z.object({
      sk: z.object({
        name: v.string().trim().min(1, v.required),
        abstract: v.string().trim().min(1, v.required),
        keywords: z
          .array(v.string().trim().min(1, v.required))
          .min(1, t("keywords", { value: 1 })),
      }),
      en: z.object({
        name: v.string().trim().min(1, v.required),
        abstract: v.string().trim().min(1, v.required),
        keywords: z
          .array(v.string().trim().min(1, v.required))
          .min(1, t("keywords", { value: 1 })),
      }),
    }),
  });
  type FormValues = z.input<typeof schema>;
  return (
    <FormContainer
      schema={schema}
      defaultValues={{
        translations: {
          sk: {
            name: submission?.translations.sk.name || "",
            abstract: submission?.translations.sk.abstract || "",
            keywords: submission?.translations.sk.keywords || [],
          },
          en: {
            name: submission?.translations.en.name || "",
            abstract: submission?.translations.en.abstract || "",
            keywords: submission?.translations.en.keywords || [],
          },
        },
        authors: [],
        files: undefined,
        conference: conference.id,
        section: submission?.section.id,
        presentationLng: (submission?.presentationLng || "") as PresentationLng,
      }}
    >
      {(methods) => (
        <form
          className="space-y-6 w-80 sm:w-96"
          onSubmit={methods.handleSubmit(async (vals) => {
            const selectedSection = conference.sections.find(
              (section) => section.id === vals.section,
            );

            const { error, url } = await uploadOrDelete(
              conference.slug,
              submission?.fileUrl,
              vals.files[0],
              selectedSection?.translations.sk.name,
            );
            if (error) {
              return methods.setError("files", { message: error });
            }

            let res;
            if (submission) {
              res = await updateSubmission(
                {
                  id: submission.id,
                  data: { ...omit(vals, "files"), fileUrl: url },
                },
                attendeeId,
              );
            } else {
              res = await createSubmission({
                data: { ...omit(vals, "files"), fileUrl: url },
              });
            }

            if (res.errors) {
              handleAPIErrors(res.errors, methods.setError);
            }

            setMessage(res.message, res.success);

            if (res.success) {
              closeDialog(dialogId);
            }
          })}
        >
          <FormField<FormValues, "section">
            name="section"
            label={t("registration.submission.section", { ns: "conferences" })}
          >
            {({ field, controlProps }) => (
              <Select
                {...field}
                {...controlProps}
                options={conference.sections.map((s) => ({
                  name: s.translations[lng as "sk" | "en"].name,
                  value: s.id,
                }))}
              />
            )}
          </FormField>
          <LocalizedFormField<FormValues, `translations.${"sk" | "en"}.name`>
            name={`translations.${lng as "sk" | "en"}.name`}
            lng={lng}
            label={t("registration.submission.name", { ns: "conferences" })}
          >
            {({ field, controlProps }) => (
              <Textarea
                {...field}
                {...controlProps}
                value={field.value ?? ""}
              />
            )}
          </LocalizedFormField>
          <LocalizedFormField<
            FormValues,
            `translations.${"sk" | "en"}.abstract`
          >
            name={`translations.${lng as "sk" | "en"}.abstract`}
            lng={lng}
            label={t("registration.submission.abstract", { ns: "conferences" })}
          >
            {({ field, controlProps }) => (
              <Textarea
                {...field}
                {...controlProps}
                value={field.value ?? ""}
              />
            )}
          </LocalizedFormField>
          <LocalizedFormField<
            FormValues,
            `translations.${"sk" | "en"}.keywords`
          >
            name={`translations.${lng as "sk" | "en"}.keywords`}
            lng={lng}
            label={t("registration.submission.keywords.label", {
              ns: "conferences",
            })}
          >
            {({ field, controlProps, onError, itemErrors }) => (
              <GenericCombobox<{ id: number; val: string }, string>
                {...field}
                {...controlProps}
                lng={lng}
                placeholder={t("registration.submission.keywords.placeholder", {
                  ns: "conferences",
                })}
                defaultOptions={[]}
                renderOption={(opt) => <span>{opt.val}</span>}
                getOptionLabel={(opt) => opt.val}
                getOptionValue={(opt) => opt?.val ?? ""}
                allowCreateNewOptions
                multiple
                onError={onError}
                itemErrors={itemErrors}
              />
            )}
          </LocalizedFormField>
          <FormField<FormValues, "presentationLng">
            name="presentationLng"
            label={t("registration.submission.lng", { ns: "conferences" })}
          >
            {({ field, controlProps }) => (
              <Select
                {...field}
                {...controlProps}
                options={[
                  { name: PresentationLng.Sk, value: PresentationLng.Sk },
                  { name: PresentationLng.Cz, value: PresentationLng.Cz },
                  { name: PresentationLng.En, value: PresentationLng.En },
                ]}
              />
            )}
          </FormField>
          <FormField<FormValues, "authors">
            name="authors"
            label={t("registration.submission.authors.label", {
              ns: "conferences",
            })}
            description={t("registration.submission.authors.description", {
              ns: "conferences",
            })}
          >
            {({ field, controlProps, onError, itemErrors }) => (
              <GenericCombobox<{ id: number; val: string }, string>
                {...field}
                {...controlProps}
                lng={lng}
                placeholder={t("registration.submission.authors.placeholder", {
                  ns: "conferences",
                })}
                defaultOptions={[]}
                renderOption={(opt) => <span>{opt.val}</span>}
                getOptionLabel={(opt) => opt.val}
                getOptionValue={(opt) => opt?.val ?? ""}
                allowCreateNewOptions
                multiple
                onError={onError}
                itemErrors={itemErrors}
              />
            )}
          </FormField>
          <FormField<FormValues, "files">
            name="files"
            label={t("registration.submission.file", {
              ns: "conferences",
            })}
          >
            {({ field, controlProps, initialize, onError }) => (
              <MultipleFileUploadField
                {...field}
                {...controlProps}
                maxFiles={1}
                accept={{
                  "application/pdf": [".pdf"],
                  "application/msword": [".doc"],
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                    [".docx"],
                }}
                fileSources={{ [conference.slug]: submission?.fileUrl }}
                onLoad={initialize}
                onError={onError}
              />
            )}
          </FormField>

          <Button
            color="primary"
            type="submit"
            className="w-full"
            disabled={methods.formState.isSubmitting}
          >
            {methods.formState.isSubmitting ? (
              <Spinner inverted />
            ) : (
              t(submission ? "update" : "create", { ns: "common" })
            )}
          </Button>
        </form>
      )}
    </FormContainer>
  );
}
