"use client";
import { z } from "zod";

import { FormField } from "@/components/form";

import Button from "@/components/Button";
import { FormContainer } from "@/components/form";
import MultipleFileUploadField from "@/components/MultipleFileUploadField";
import Select from "@/components/Select";
import Spinner from "@/components/Spinner";
import useValidation from "@/hooks/useValidation";
import { uploadOrDelete } from "@/lib/utilsClient";
import {
  ApplicationFragment,
  Semester,
  UserFragment,
} from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { deleteFiles } from "@/lib/minio";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";
import { useParams } from "next/navigation";
import { changeInternData, createIntern } from "./actions";

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

  const { v } = useValidation();

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  const schema = z.object({
    files: z
      .array(z.file({ error: v.required }))
      .min(1, t("minFiles", { value: 1, ns: "validation" }))
      .max(5, t("maxFiles", { value: 5, ns: "validation" })),
    semester: z.enum(Semester, { error: v.required }),
  });
  type FormValues = z.input<typeof schema>;
  return (
    <FormContainer
      schema={schema}
      defaultValues={{
        files: undefined,
        semester: application?.semester ?? Semester.Winter,
      }}
    >
      {(methods) => (
        <form
          onSubmit={methods.handleSubmit(
            async (vals) => {
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
                    user.email,
                  );
                  if (error) {
                    return methods.setError("files", { message: error });
                  }
                  if (url) {
                    urls.push(url);
                  }
                }

                state = await changeInternData({
                  fileUrls: urls,
                  id: application.id,
                  semester: vals.semester,
                });
              } else {
                console.log("NEW");

                for (const file of vals.files) {
                  const { error, url } = await uploadOrDelete(
                    "internships",
                    null,
                    file,
                    user.email,
                  );
                  if (error) {
                    return methods.setError("files", { message: error });
                  }
                  if (url) {
                    urls.push(url);
                  }
                }

                state = await createIntern({
                  internshipId,
                  fileUrls: urls,
                  semester: vals.semester,
                });
                if (!state.success) {
                  await deleteFiles(urls);
                }
              }

              setMessage(state.message, state.success);

              if (state.success) {
                closeDialog(dialogId);
              }
            },
            (err) => console.log(err),
          )}
          className="space-y-6 sm:w-96"
        >
          <FormField<FormValues, "semester">
            name="semester"
            label={"Mam zaujem stazovat v semestri"}
          >
            {({ field, controlProps }) => (
              <Select
                {...field}
                {...controlProps}
                options={[
                  { name: "Zimny", value: Semester.Winter },
                  { name: "Letny", value: Semester.Summer },
                  { name: "Zimny aj letny", value: Semester.Both },
                ]}
              />
            )}
          </FormField>

          <FormField<FormValues, "files">
            name="files"
            label="CV, motivacny list, ine... (.pdf)"
          >
            {({ field, controlProps, initialize, onError }) => (
              <MultipleFileUploadField
                {...field}
                {...controlProps}
                maxFiles={5}
                accept={{
                  "application/pdf": [".pdf"],
                }}
                fileSources={{
                  resumes: !application?.fileUrls ? user?.cvUrl : undefined,
                  internships: application?.fileUrls,
                }}
                onLoad={initialize}
                onError={onError}
              />
            )}
          </FormField>
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
    </FormContainer>
  );
}
