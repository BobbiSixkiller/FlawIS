"use client";

import { useTranslation } from "@/lib/i18n/client";
import Button from "@/components/Button";
import {
  ConferenceQuery,
  PresentationLng,
  SubmissionFragment,
} from "@/lib/graphql/generated/graphql";
import { LocalizedTextarea } from "@/components/Textarea";
import Select from "@/components/Select";
import MultipleFileUploadField from "@/components/MultipleFileUploadField";
import { handleAPIErrors, uploadOrDelete } from "@/utils/helpers";
import useValidation from "@/hooks/useValidation";
import Spinner from "@/components/Spinner";
import { useDialogStore } from "@/stores/dialogStore";
import { createSubmission, updateSubmission } from "./actions";
import { useMessageStore } from "@/stores/messageStore";
import usePrefillFiles from "@/hooks/usePrefillFiles";
import RHFormContainer from "@/components/RHFormContainer";
import { omit } from "lodash";
import GenericCombobox, {
  LocalizedGenericCombobox,
} from "@/components/GenericCombobox";

export default function SubmissionForm({
  submission,
  conference,
  lng,
  dialogId,
}: {
  lng: string;
  submission?: SubmissionFragment;
  conference: Pick<ConferenceQuery["conference"], "id" | "slug" | "sections">;
  dialogId: string;
}) {
  const { t } = useTranslation(lng, ["validation", "common", "conferences"]);

  const { files, errors, loading } = usePrefillFiles({
    [conference.slug]: submission?.fileUrl,
  });

  const { yup } = useValidation();

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  if (loading)
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );

  return (
    <RHFormContainer
      errors={errors}
      yupSchema={yup.object({
        conference: yup.string().required(),
        section: yup.string().required(),
        authors: yup.array().of(yup.string().email().required()).default([]),
        files: yup
          .array()
          .of(yup.mixed<File>().required())
          .required()
          .max(1, (val) => t("maxFiles", { value: val.max })),
        fileUrl: yup.string(),
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
      })}
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
        files: files[conference.slug],
        conference: conference.id,
        section: submission?.section.id,
        presentationLng: (submission?.presentationLng || "") as PresentationLng,
      }}
    >
      {(methods) => (
        <form
          className="space-y-6 w-80 sm:w-96"
          onSubmit={methods.handleSubmit(async (vals) => {
            console.log(vals.files);
            const { error, url } = await uploadOrDelete(
              conference.slug,
              submission?.fileUrl,
              vals.files[0],
              submission?.section.translations.sk.name
            );
            if (error) {
              return methods.setError("files", { message: error });
            }

            console.log(url);

            let res;
            if (submission) {
              res = await updateSubmission({
                id: submission?.id,
                data: { ...omit(vals, "files"), fileUrl: url },
              });
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
          <Select
            control={methods.control}
            name="section"
            label={t("registration.submission.section", { ns: "conferences" })}
            options={conference.sections.map((s) => ({
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
          <LocalizedGenericCombobox<{ id: number; val: string }, string>
            control={methods.control}
            name={`translations.${lng}.keywords`}
            lng={lng}
            label={t("registration.submission.keywords.label", {
              ns: "conferences",
            })}
            placeholder={t("registration.submission.keywords.placeholder", {
              ns: "conferences",
            })}
            defaultOptions={[]}
            renderOption={(opt) => <span>{opt.val}</span>}
            getOptionLabel={(opt) => opt.val}
            getOptionValue={(opt) => opt?.val ?? ""}
            allowCreateNewOptions
            multiple
          />
          <Select
            control={methods.control}
            name="presentationLng"
            label={t("registration.submission.lng", { ns: "conferences" })}
            options={[
              { name: PresentationLng.Sk, value: PresentationLng.Sk },
              { name: PresentationLng.Cz, value: PresentationLng.Cz },
              { name: PresentationLng.En, value: PresentationLng.En },
            ]}
          />
          <GenericCombobox<{ id: number; val: string }, string>
            control={methods.control}
            name="authors"
            lng={lng}
            label={t("registration.submission.authors.label", {
              ns: "conferences",
            })}
            placeholder={t("registration.submission.authors.placeholder", {
              ns: "conferences",
            })}
            defaultOptions={[]}
            renderOption={(opt) => <span>{opt.val}</span>}
            getOptionLabel={(opt) => opt.val}
            getOptionValue={(opt) => opt?.val ?? ""}
            allowCreateNewOptions
            multiple
          />
          <MultipleFileUploadField
            label={t("registration.submission.file", {
              ns: "conferences",
            })}
            name="files"
            control={methods.control}
            setValue={methods.setValue}
            setError={methods.setError}
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
            className="w-full"
            disabled={methods.formState.isSubmitting}
          >
            {methods.formState.isSubmitting ? (
              <Spinner inverted />
            ) : (
              t("update", { ns: "common" })
            )}
          </Button>
        </form>
      )}
    </RHFormContainer>
  );
}
