"use client";

import Button from "@/components/Button";
import MultipleFileUploadField from "@/components/MultipleFileUploadField";
import Spinner from "@/components/Spinner";
import useValidation from "@/hooks/useValidation";
import { ApplicationFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { uploadOrDelete } from "@/utils/helpers";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { updateOrgFeedback } from "./actions";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import usePrefillFiles from "@/hooks/usePrefillFiles";

export default function CertificateForm({
  application,
  dialogId,
}: {
  application: ApplicationFragment;
  dialogId: string;
}) {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, ["validation", "common", "internships"]);

  const { yup } = useValidation();

  const methods = useForm({
    resolver: yupResolver(
      yup.object({
        files: yup
          .array()
          .of(yup.mixed<File>().required())
          .min(1, (val) => t("minFiles", { value: val.min, ns: "validation" }))
          .max(1, (val) => t("maxFiles", { value: val.max, ns: "validation" }))
          .required(),
      })
    ),
    defaultValues: { files: [] },
  });

  const isLoading = usePrefillFiles({
    fileUrls: application.organizationFeedbackUrl
      ? [application.organizationFeedbackUrl]
      : undefined,
    setError: methods.setError,
    setValue: methods.setValue,
  });

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6"
        onSubmit={methods.handleSubmit(
          async (vals) => {
            console.log(vals);
            const { url, error } = await uploadOrDelete(
              "internships",
              application.organizationFeedbackUrl,
              vals.files[0],
              application.user.email
            );
            if (error) {
              return methods.setError("files", { message: error });
            }
            if (url) {
              const res = await updateOrgFeedback(application.id, url);
              setMessage(res.message, res.success);

              if (res.success) {
                closeDialog(dialogId);
              }
            }
          },
          (err) => console.log(err)
        )}
      >
        <MultipleFileUploadField
          name="files"
          label={t("orgFeedback", { ns: "internships" })}
          maxFiles={1}
          accept={{
            "application/pdf": [".pdf"],
          }}
        />

        <Button type="submit" size="sm" className="w-full">
          {methods.formState.isSubmitting ? (
            <Spinner inverted />
          ) : (
            t("submit", { ns: "common" })
          )}
        </Button>
      </form>
    </FormProvider>
  );
}
