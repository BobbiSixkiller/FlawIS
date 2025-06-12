"use client";

import Button from "@/components/Button";
import { FormMessage } from "@/components/Message";
import Modal from "@/components/Modal";
import MultipleFileUploadField from "@/components/MultipleFileUploadField";
import Spinner from "@/components/Spinner";
import useValidation from "@/hooks/useValidation";
import { ApplicationFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { fetchFromMinio, uploadOrDelete } from "@/utils/helpers";
import { InboxArrowDownIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { updateOrgFeedback } from "./actions";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";

export default function InternCertificateDialog({
  application,
}: {
  application: ApplicationFragment;
}) {
  const dialogId = "intern-certificate";
  const [loadingFiles, setLoadingFiles] = useState(true);

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

  const fetchFiles = useCallback(async () => {
    try {
      const clientFiles: File[] = [];

      if (application.organizationFeedbackUrl) {
        const file = await fetchFromMinio(
          "internships",
          application.organizationFeedbackUrl
        );
        clientFiles.push(file);
      }

      methods.setValue("files", clientFiles);

      setLoadingFiles(false);
    } catch (error: any) {
      console.log(error.message);
      methods.setError("files", { message: error.message });
      setLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, []);

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const openDialog = useDialogStore((s) => s.openDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  return (
    <div>
      <Button size="icon" type="button" onClick={() => openDialog(dialogId)}>
        <InboxArrowDownIcon className="size-5" />
      </Button>

      <Modal dialogId={dialogId} title={t("upload", { ns: "common" })}>
        {loadingFiles ? (
          <div className="h-full mx-auto flex flex-col items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <FormProvider {...methods}>
            <form
              className="space-y-6"
              onSubmit={methods.handleSubmit(async (vals) => {
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
                  const state = await updateOrgFeedback(application.id, url);
                  setMessage(state.message, state.success);

                  if (state.success) {
                    closeDialog(dialogId);
                  }
                }
              })}
            >
              <FormMessage />

              <MultipleFileUploadField
                name="files"
                label={t("orgFeedback", { ns: "internships" })}
                maxFiles={1}
                accept={{
                  "application/pdf": [".pdf"],
                }}
              />

              <Button size="sm" className="w-full">
                {methods.formState.isSubmitting ? (
                  <Spinner inverted />
                ) : (
                  t("submit", { ns: "common" })
                )}
              </Button>
            </form>
          </FormProvider>
        )}
      </Modal>
    </div>
  );
}
