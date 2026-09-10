"use client";
import { z } from "zod";

import { FormField } from "@/components/form";

import Button from "@/components/Button";
import { FormContainer } from "@/components/form";
import MultipleFileUploadField from "@/components/MultipleFileUploadField";
import Spinner from "@/components/Spinner";
import useValidation from "@/hooks/useValidation";
import { uploadOrDelete } from "@/lib/utilsClient";
import { ApplicationFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import { useParams } from "next/navigation";
import { updateOrgFeedback } from "./actions";

export default function CertificateForm({
  application,
  dialogId,
}: {
  application: ApplicationFragment;
  dialogId: string;
}) {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, ["validation", "common", "internships"]);

  const { v } = useValidation();

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  const schema = z.object({
    files: z
      .array(z.file({ error: v.required }))
      .min(1, t("minFiles", { value: 1, ns: "validation" }))
      .max(1, t("maxFiles", { value: 1, ns: "validation" })),
  });
  type FormValues = z.input<typeof schema>;
  return (
    <FormContainer schema={schema} defaultValues={{ files: undefined }}>
      {(methods) => (
        <form
          className="space-y-6"
          onSubmit={methods.handleSubmit(
            async (vals) => {
              console.log(vals);
              const { url, error } = await uploadOrDelete(
                "internships",
                application.organizationFeedbackUrl,
                vals.files[0],
                application.user.email,
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
            (err) => console.log(err),
          )}
        >
          <FormField<FormValues, "files">
            name="files"
            label={t("orgFeedback", { ns: "internships" })}
          >
            {({ field, controlProps, initialize, onError }) => (
              <MultipleFileUploadField
                {...field}
                {...controlProps}
                maxFiles={1}
                accept={{
                  "application/pdf": [".pdf"],
                }}
                fileSources={{
                  internships: application.organizationFeedbackUrl,
                }}
                onLoad={initialize}
                onError={onError}
              />
            )}
          </FormField>

          <Button type="submit" size="sm" className="w-full">
            {methods.formState.isSubmitting ? (
              <Spinner inverted />
            ) : (
              t("submit", { ns: "common" })
            )}
          </Button>
        </form>
      )}
    </FormContainer>
  );
}
