"use client";

import Button from "@/components/Button";
import MultipleFileUploadField from "@/components/MultipleFileUploadField";
import Spinner from "@/components/Spinner";
import useValidation from "@/hooks/useValidation";
import {
  ApplicationFragment,
  UserFragment,
} from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { uploadOrDelete } from "@/utils/helpers";
import { useParams } from "next/navigation";
import { deleteFiles } from "@/lib/minio";
import { changeInternFiles, createIntern } from "./actions";
import usePrefillFiles from "@/hooks/usePrefillFiles";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import RHFormContainer from "@/components/RHFormContainer";

export default function ApplicationForm({
  user,
  application,
  dialogId,
}: {
  user: UserFragment;
  application?: ApplicationFragment | null;
  dialogId: string;
}) {
  const { lng, internshipId } = useParams<{
    lng: string;
    internshipId: string;
  }>();
  const { t } = useTranslation(lng, ["validation", "common"]);

  const { yup } = useValidation();

  const { loading, files, errors } = usePrefillFiles({
    resumes: user?.cvUrl,
    internships: application?.fileUrls,
  });

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
        files: yup
          .array()
          .of(yup.mixed<File>().required())
          .min(1, (val) => t("minFiles", { value: val.min, ns: "validation" }))
          .max(5, (val) => t("maxFiles", { value: val.max, ns: "validation" }))
          .required(),
      })}
      defaultValues={{
        files: application?.fileUrls ? files.internships : files.resumes,
      }}
    >
      {(methods) => (
        <form
          onSubmit={methods.handleSubmit(
            async (vals) => {
              console.log(vals);
              console.log(internshipId);

              const urls = [];
              let state;

              // If there is application prop perform update of intern's files otherwise create new intern
              if (application) {
                console.log("UPDATE");

                for (const [index, file] of vals.files.entries()) {
                  const { error, url } = await uploadOrDelete(
                    "internships",
                    application?.fileUrls[index],
                    file,
                    user.email
                  );
                  if (error) {
                    return methods.setError("files", { message: error });
                  }
                  if (url) {
                    urls.push(url);
                  }
                }

                state = await changeInternFiles(application.id, urls);
              } else {
                console.log("NEW");

                for (const file of vals.files) {
                  const { error, url } = await uploadOrDelete(
                    "internships",
                    null,
                    file,
                    user.email
                  );
                  if (error) {
                    return methods.setError("files", { message: error });
                  }
                  if (url) {
                    urls.push(url);
                  }
                }

                state = await createIntern(urls, internshipId);
                if (!state.success) {
                  await deleteFiles(urls);
                }
              }

              setMessage(state.message, state.success);

              if (state.success) {
                closeDialog(dialogId);
              }
            },
            (err) => console.log(err)
          )}
          className="space-y-6 sm:w-96"
        >
          <MultipleFileUploadField
            control={methods.control}
            setValue={methods.setValue}
            setError={methods.setError}
            label="CV, motivacny list, ine... (.pdf)"
            name="files"
            maxFiles={5}
            accept={{
              "application/pdf": [".pdf"],
            }}
          />
          <Button
            type="submit"
            disabled={methods.formState.isSubmitting}
            className="w-full"
          >
            {methods.formState.isSubmitting ? (
              <Spinner inverted />
            ) : (
              t("submit", { ns: "common" })
            )}
          </Button>
        </form>
      )}
    </RHFormContainer>
  );
}
